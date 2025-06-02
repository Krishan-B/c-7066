// Security Test Results Processor
// Analyzes and processes security test results for comprehensive reporting

const fs = require('fs');
const path = require('path');

class SecurityTestResultsProcessor {
  constructor() {
    this.securityMetrics = {
      totalTests: 0,
      passedTests: 0,
      failedTests: 0,
      securityCoverage: 0,
      vulnerabilitiesFound: [],
      riskScore: 0,
      recommendations: []
    };
  }

  processResults(results) {
    console.log('\n🔒 Processing Security Test Results...\n');

    this.calculateBasicMetrics(results);
    this.analyzeSecurityCoverage(results);
    this.identifyVulnerabilities(results);
    this.calculateRiskScore();
    this.generateRecommendations();
    this.generateSecurityReport();

    return this.securityMetrics;
  }

  calculateBasicMetrics(results) {
    this.securityMetrics.totalTests = results.numTotalTests;
    this.securityMetrics.passedTests = results.numPassedTests;
    this.securityMetrics.failedTests = results.numFailedTests;

    console.log(`📊 Basic Metrics:`);
    console.log(`   Total Tests: ${this.securityMetrics.totalTests}`);
    console.log(`   Passed: ${this.securityMetrics.passedTests}`);
    console.log(`   Failed: ${this.securityMetrics.failedTests}`);
    console.log(`   Success Rate: ${((this.securityMetrics.passedTests / this.securityMetrics.totalTests) * 100).toFixed(2)}%\n`);
  }

  analyzeSecurityCoverage(results) {
    const securityDomains = {
      authentication: 0,
      authorization: 0,
      inputValidation: 0,
      apiSecurity: 0,
      dataProtection: 0,
      sessionManagement: 0,
      cryptography: 0,
      networkSecurity: 0
    };

    results.testResults.forEach(testResult => {
      const testPath = testResult.testFilePath;
      
      if (testPath.includes('authentication')) {
        securityDomains.authentication += testResult.numPassingTests;
      }
      if (testPath.includes('authorization')) {
        securityDomains.authorization += testResult.numPassingTests;
      }
      if (testPath.includes('input-validation')) {
        securityDomains.inputValidation += testResult.numPassingTests;
      }
      if (testPath.includes('api-security')) {
        securityDomains.apiSecurity += testResult.numPassingTests;
      }
      if (testPath.includes('integration')) {
        securityDomains.networkSecurity += testResult.numPassingTests;
      }
    });

    const totalDomainTests = Object.values(securityDomains).reduce((sum, count) => sum + count, 0);
    this.securityMetrics.securityCoverage = totalDomainTests > 0 ? (totalDomainTests / this.securityMetrics.totalTests) * 100 : 0;

    console.log(`🎯 Security Domain Coverage:`);
    Object.entries(securityDomains).forEach(([domain, count]) => {
      console.log(`   ${domain}: ${count} tests`);
    });
    console.log(`   Overall Coverage: ${this.securityMetrics.securityCoverage.toFixed(2)}%\n`);
  }

  identifyVulnerabilities(results) {
    const vulnerabilityPatterns = [
      { pattern: /sql.?injection/i, severity: 'critical', type: 'SQL Injection' },
      { pattern: /xss|cross.?site.?scripting/i, severity: 'high', type: 'Cross-Site Scripting' },
      { pattern: /csrf|cross.?site.?request.?forgery/i, severity: 'medium', type: 'CSRF' },
      { pattern: /authentication.?bypass/i, severity: 'critical', type: 'Authentication Bypass' },
      { pattern: /authorization.?bypass/i, severity: 'critical', type: 'Authorization Bypass' },
      { pattern: /password.?policy/i, severity: 'medium', type: 'Weak Password Policy' },
      { pattern: /api.?key.?exposure/i, severity: 'critical', type: 'API Key Exposure' },
      { pattern: /rate.?limit/i, severity: 'medium', type: 'Rate Limiting Issues' },
      { pattern: /session.?management/i, severity: 'high', type: 'Session Management' },
      { pattern: /encryption|crypto/i, severity: 'high', type: 'Cryptographic Issues' }
    ];

    results.testResults.forEach(testResult => {
      testResult.assertionResults.forEach(assertion => {
        if (assertion.status === 'failed') {
          vulnerabilityPatterns.forEach(vuln => {
            if (vuln.pattern.test(assertion.title) || vuln.pattern.test(assertion.failureMessages?.join(' ') || '')) {
              this.securityMetrics.vulnerabilitiesFound.push({
                type: vuln.type,
                severity: vuln.severity,
                testCase: assertion.title,
                file: testResult.testFilePath,
                message: assertion.failureMessages?.[0] || 'Test failed',
                timestamp: new Date().toISOString()
              });
            }
          });
        }
      });
    });

    console.log(`🚨 Vulnerabilities Found: ${this.securityMetrics.vulnerabilitiesFound.length}`);
    this.securityMetrics.vulnerabilitiesFound.forEach(vuln => {
      console.log(`   ${vuln.severity.toUpperCase()}: ${vuln.type} - ${vuln.testCase}`);
    });
    console.log('');
  }

  calculateRiskScore() {
    const severityWeights = {
      critical: 10,
      high: 7,
      medium: 4,
      low: 1
    };

    let totalRisk = 0;
    this.securityMetrics.vulnerabilitiesFound.forEach(vuln => {
      totalRisk += severityWeights[vuln.severity] || 1;
    });

    // Factor in test coverage
    const coveragePenalty = (100 - this.securityMetrics.securityCoverage) * 0.1;
    
    // Factor in failure rate
    const failureRate = (this.securityMetrics.failedTests / this.securityMetrics.totalTests) * 100;
    const failurePenalty = failureRate * 0.5;

    this.securityMetrics.riskScore = Math.min(100, totalRisk + coveragePenalty + failurePenalty);

    let riskLevel = 'LOW';
    if (this.securityMetrics.riskScore >= 50) riskLevel = 'CRITICAL';
    else if (this.securityMetrics.riskScore >= 30) riskLevel = 'HIGH';
    else if (this.securityMetrics.riskScore >= 15) riskLevel = 'MEDIUM';

    console.log(`⚠️  Risk Assessment:`);
    console.log(`   Risk Score: ${this.securityMetrics.riskScore.toFixed(2)}/100`);
    console.log(`   Risk Level: ${riskLevel}\n`);
  }

  generateRecommendations() {
    const recommendations = [];

    // Coverage-based recommendations
    if (this.securityMetrics.securityCoverage < 80) {
      recommendations.push({
        priority: 'high',
        category: 'test_coverage',
        title: 'Increase Security Test Coverage',
        description: `Current security test coverage is ${this.securityMetrics.securityCoverage.toFixed(2)}%. Target should be 80%+.`,
        action: 'Add more comprehensive security tests across all domains.'
      });
    }

    // Vulnerability-based recommendations
    const criticalVulns = this.securityMetrics.vulnerabilitiesFound.filter(v => v.severity === 'critical');
    if (criticalVulns.length > 0) {
      recommendations.push({
        priority: 'critical',
        category: 'vulnerability',
        title: 'Fix Critical Security Vulnerabilities',
        description: `${criticalVulns.length} critical security issues found.`,
        action: 'Immediately address all critical vulnerabilities before deployment.'
      });
    }

    // API security recommendations
    const apiVulns = this.securityMetrics.vulnerabilitiesFound.filter(v => v.type.includes('API'));
    if (apiVulns.length > 0) {
      recommendations.push({
        priority: 'high',
        category: 'api_security',
        title: 'Strengthen API Security',
        description: 'API security vulnerabilities detected.',
        action: 'Implement proper API authentication, rate limiting, and input validation.'
      });
    }

    // Authentication recommendations
    const authVulns = this.securityMetrics.vulnerabilitiesFound.filter(v => 
      v.type.includes('Authentication') || v.type.includes('Authorization')
    );
    if (authVulns.length > 0) {
      recommendations.push({
        priority: 'critical',
        category: 'authentication',
        title: 'Fix Authentication/Authorization Issues',
        description: 'Authentication or authorization vulnerabilities found.',
        action: 'Review and strengthen authentication mechanisms and access controls.'
      });
    }

    // General recommendations based on risk score
    if (this.securityMetrics.riskScore > 30) {
      recommendations.push({
        priority: 'high',
        category: 'security_review',
        title: 'Conduct Security Code Review',
        description: 'High risk score indicates potential security issues.',
        action: 'Perform comprehensive security code review and penetration testing.'
      });
    }

    this.securityMetrics.recommendations = recommendations;

    console.log(`💡 Security Recommendations:`);
    recommendations.forEach((rec, index) => {
      console.log(`   ${index + 1}. [${rec.priority.toUpperCase()}] ${rec.title}`);
      console.log(`      ${rec.description}`);
      console.log(`      Action: ${rec.action}\n`);
    });
  }

  generateSecurityReport() {
    const reportPath = path.join(process.cwd(), 'coverage', 'security', 'security-report.json');
    const htmlReportPath = path.join(process.cwd(), 'coverage', 'security', 'security-report.html');

    // Ensure directory exists
    const reportDir = path.dirname(reportPath);
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true });
    }

    // Generate JSON report
    const jsonReport = {
      timestamp: new Date().toISOString(),
      summary: {
        totalTests: this.securityMetrics.totalTests,
        passedTests: this.securityMetrics.passedTests,
        failedTests: this.securityMetrics.failedTests,
        successRate: ((this.securityMetrics.passedTests / this.securityMetrics.totalTests) * 100).toFixed(2),
        securityCoverage: this.securityMetrics.securityCoverage.toFixed(2),
        riskScore: this.securityMetrics.riskScore.toFixed(2),
        riskLevel: this.getRiskLevel()
      },
      vulnerabilities: this.securityMetrics.vulnerabilitiesFound,
      recommendations: this.securityMetrics.recommendations,
      metadata: {
        generatedBy: 'TradePro Security Test Suite',
        version: '1.0.0',
        environment: process.env.NODE_ENV || 'test'
      }
    };

    fs.writeFileSync(reportPath, JSON.stringify(jsonReport, null, 2));

    // Generate HTML report
    const htmlReport = this.generateHTMLReport(jsonReport);
    fs.writeFileSync(htmlReportPath, htmlReport);

    console.log(`📋 Security Report Generated:`);
    console.log(`   JSON: ${reportPath}`);
    console.log(`   HTML: ${htmlReportPath}\n`);
  }

  getRiskLevel() {
    if (this.securityMetrics.riskScore >= 50) return 'CRITICAL';
    if (this.securityMetrics.riskScore >= 30) return 'HIGH';
    if (this.securityMetrics.riskScore >= 15) return 'MEDIUM';
    return 'LOW';
  }

  generateHTMLReport(data) {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>TradePro Security Test Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { text-align: center; margin-bottom: 30px; }
        .header h1 { color: #333; margin-bottom: 10px; }
        .timestamp { color: #666; font-size: 14px; }
        .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .metric { background: #f8f9fa; padding: 15px; border-radius: 5px; text-align: center; }
        .metric-value { font-size: 24px; font-weight: bold; color: #007bff; }
        .metric-label { font-size: 12px; color: #666; text-transform: uppercase; }
        .risk-critical { color: #dc3545; }
        .risk-high { color: #fd7e14; }
        .risk-medium { color: #ffc107; }
        .risk-low { color: #28a745; }
        .section { margin-bottom: 30px; }
        .section h2 { color: #333; border-bottom: 2px solid #007bff; padding-bottom: 5px; }
        .vulnerability { background: #fff; border-left: 4px solid #dc3545; padding: 15px; margin-bottom: 10px; border-radius: 0 5px 5px 0; }
        .vulnerability.high { border-left-color: #fd7e14; }
        .vulnerability.medium { border-left-color: #ffc107; }
        .vulnerability.low { border-left-color: #28a745; }
        .recommendation { background: #e7f3ff; border-left: 4px solid #007bff; padding: 15px; margin-bottom: 10px; border-radius: 0 5px 5px 0; }
        .recommendation.critical { border-left-color: #dc3545; background: #fff5f5; }
        .recommendation.high { border-left-color: #fd7e14; background: #fff8f0; }
        .badge { display: inline-block; padding: 3px 8px; border-radius: 3px; font-size: 12px; font-weight: bold; text-transform: uppercase; }
        .badge.critical { background: #dc3545; color: white; }
        .badge.high { background: #fd7e14; color: white; }
        .badge.medium { background: #ffc107; color: #333; }
        .badge.low { background: #28a745; color: white; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔒 TradePro Security Test Report</h1>
            <div class="timestamp">Generated on ${new Date(data.timestamp).toLocaleString()}</div>
        </div>

        <div class="summary">
            <div class="metric">
                <div class="metric-value">${data.summary.totalTests}</div>
                <div class="metric-label">Total Tests</div>
            </div>
            <div class="metric">
                <div class="metric-value">${data.summary.successRate}%</div>
                <div class="metric-label">Success Rate</div>
            </div>
            <div class="metric">
                <div class="metric-value">${data.summary.securityCoverage}%</div>
                <div class="metric-label">Security Coverage</div>
            </div>
            <div class="metric">
                <div class="metric-value risk-${data.summary.riskLevel.toLowerCase()}">${data.summary.riskScore}</div>
                <div class="metric-label">Risk Score</div>
            </div>
        </div>

        <div class="section">
            <h2>🚨 Security Vulnerabilities (${data.vulnerabilities.length})</h2>
            ${data.vulnerabilities.length === 0 ? 
                '<p>No security vulnerabilities detected! ✅</p>' :
                data.vulnerabilities.map(vuln => `
                    <div class="vulnerability ${vuln.severity}">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <h3 style="margin: 0; color: #333;">${vuln.type}</h3>
                            <span class="badge ${vuln.severity}">${vuln.severity}</span>
                        </div>
                        <p><strong>Test:</strong> ${vuln.testCase}</p>
                        <p><strong>File:</strong> ${vuln.file}</p>
                        <p><strong>Details:</strong> ${vuln.message}</p>
                    </div>
                `).join('')
            }
        </div>

        <div class="section">
            <h2>💡 Security Recommendations (${data.recommendations.length})</h2>
            ${data.recommendations.map(rec => `
                <div class="recommendation ${rec.priority}">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <h3 style="margin: 0; color: #333;">${rec.title}</h3>
                        <span class="badge ${rec.priority}">${rec.priority}</span>
                    </div>
                    <p><strong>Description:</strong> ${rec.description}</p>
                    <p><strong>Action:</strong> ${rec.action}</p>
                </div>
            `).join('')}
        </div>

        <div class="section">
            <h2>📊 Test Summary</h2>
            <table style="width: 100%; border-collapse: collapse;">
                <tr style="background: #f8f9fa;">
                    <th style="padding: 10px; border: 1px solid #dee2e6; text-align: left;">Metric</th>
                    <th style="padding: 10px; border: 1px solid #dee2e6; text-align: right;">Value</th>
                </tr>
                <tr>
                    <td style="padding: 10px; border: 1px solid #dee2e6;">Total Tests</td>
                    <td style="padding: 10px; border: 1px solid #dee2e6; text-align: right;">${data.summary.totalTests}</td>
                </tr>
                <tr>
                    <td style="padding: 10px; border: 1px solid #dee2e6;">Passed Tests</td>
                    <td style="padding: 10px; border: 1px solid #dee2e6; text-align: right;">${data.summary.passedTests}</td>
                </tr>
                <tr>
                    <td style="padding: 10px; border: 1px solid #dee2e6;">Failed Tests</td>
                    <td style="padding: 10px; border: 1px solid #dee2e6; text-align: right;">${data.summary.failedTests}</td>
                </tr>
                <tr>
                    <td style="padding: 10px; border: 1px solid #dee2e6;">Security Coverage</td>
                    <td style="padding: 10px; border: 1px solid #dee2e6; text-align: right;">${data.summary.securityCoverage}%</td>
                </tr>
                <tr>
                    <td style="padding: 10px; border: 1px solid #dee2e6;">Risk Score</td>
                    <td style="padding: 10px; border: 1px solid #dee2e6; text-align: right;" class="risk-${data.summary.riskLevel.toLowerCase()}">${data.summary.riskScore}</td>
                </tr>
                <tr>
                    <td style="padding: 10px; border: 1px solid #dee2e6;">Risk Level</td>
                    <td style="padding: 10px; border: 1px solid #dee2e6; text-align: right;" class="risk-${data.summary.riskLevel.toLowerCase()}">${data.summary.riskLevel}</td>
                </tr>
            </table>
        </div>
    </div>
</body>
</html>`;
  }
}

module.exports = function(results) {
  const processor = new SecurityTestResultsProcessor();
  return processor.processResults(results);
};
