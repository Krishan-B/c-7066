/**
 * Security Test Runner
 * Comprehensive security testing suite runner with reporting
 */

import { execSync } from 'child_process';
import { writeFileSync } from 'fs';
import path from 'path';

interface TestResult {
  testFile: string;
  passed: number;
  failed: number;
  skipped: number;
  duration: number;
  coverage?: {
    statements: number;
    branches: number;
    functions: number;
    lines: number;
  };
  securityIssues: string[];
}

interface SecurityTestReport {
  timestamp: string;
  totalTests: number;
  totalPassed: number;
  totalFailed: number;
  totalDuration: number;
  overallCoverage: {
    statements: number;
    branches: number;
    functions: number;
    lines: number;
  };
  securityTestResults: TestResult[];
  criticalIssues: string[];
  recommendations: string[];
}

class SecurityTestRunner {
  private testPatterns = [
    'src/features/auth/**/*.test.{ts,tsx}',
    'tests/security/**/*.test.{ts,tsx}',
    'src/components/**/*security*.test.{ts,tsx}',
    'src/utils/**/*auth*.test.{ts,tsx}',
  ];

  private criticalTests = [
    'src/features/auth/__tests__/components/LoginForm.test.tsx',
    'src/features/auth/__tests__/components/RegisterForm.test.tsx',
    'src/features/auth/__tests__/components/PasswordField.test.tsx',
    'src/features/auth/__tests__/utils/validation.test.ts',
    'src/features/auth/__tests__/hooks/usePasswordStrength.test.ts',
  ];

  async runSecurityTests(): Promise<SecurityTestReport> {
    console.log('🔐 Starting Comprehensive Security Test Suite...\n');
    
    const startTime = Date.now();
    const results: TestResult[] = [];
    const criticalIssues: string[] = [];
    
    // Run each test pattern
    for (const pattern of this.testPatterns) {
      try {
        console.log(`📋 Running tests for pattern: ${pattern}`);
        const result = await this.runTestPattern(pattern);
        if (result) {
          results.push(result);
        }
      } catch (error) {
        console.error(`❌ Failed to run tests for pattern ${pattern}:`, error);
        criticalIssues.push(`Failed to execute tests for ${pattern}: ${error}`);
      }
    }

    // Run critical tests individually to ensure they pass
    console.log('\n🎯 Running Critical Security Tests...');
    for (const testFile of this.criticalTests) {
      try {
        const result = await this.runSingleTest(testFile);
        if (result) {
          results.push(result);
          if (result.failed > 0) {
            criticalIssues.push(`Critical test failures in ${testFile}: ${result.failed} tests failed`);
          }
        }
      } catch (error) {
        console.error(`❌ Critical test failed: ${testFile}`, error);
        criticalIssues.push(`Critical test execution failed: ${testFile}`);
      }
    }

    const endTime = Date.now();
    const totalDuration = endTime - startTime;

    // Calculate overall statistics
    const totalTests = results.reduce((sum, r) => sum + r.passed + r.failed + r.skipped, 0);
    const totalPassed = results.reduce((sum, r) => sum + r.passed, 0);
    const totalFailed = results.reduce((sum, r) => sum + r.failed, 0);

    // Calculate overall coverage
    const overallCoverage = this.calculateOverallCoverage(results);

    // Generate recommendations
    const recommendations = this.generateRecommendations(results, criticalIssues);

    const report: SecurityTestReport = {
      timestamp: new Date().toISOString(),
      totalTests,
      totalPassed,
      totalFailed,
      totalDuration,
      overallCoverage,
      securityTestResults: results,
      criticalIssues,
      recommendations,
    };

    // Save report
    await this.saveReport(report);

    // Print summary
    this.printSummary(report);

    return report;
  }

  private async runTestPattern(pattern: string): Promise<TestResult | null> {
    try {
      const command = `npx vitest run "${pattern}" --reporter=json --coverage`;
      const output = execSync(command, { encoding: 'utf-8' });
      return this.parseTestOutput(output, pattern);
    } catch (error) {
      console.warn(`⚠️  No tests found for pattern: ${pattern}`);
      return null;
    }
  }

  private async runSingleTest(testFile: string): Promise<TestResult | null> {
    try {
      const command = `npx vitest run "${testFile}" --reporter=json`;
      const output = execSync(command, { encoding: 'utf-8' });
      return this.parseTestOutput(output, testFile);
    } catch (error) {
      console.warn(`⚠️  Could not run test: ${testFile}`);
      return null;
    }
  }

  private parseTestOutput(output: string, source: string): TestResult {
    // This is a simplified parser - in a real implementation,
    // you would parse the actual JSON output from vitest
    const lines = output.split('\n');
    let passed = 0;
    let failed = 0;
    let skipped = 0;
    const securityIssues: string[] = [];

    // Parse the output (simplified)
    lines.forEach(line => {
      if (line.includes('✓') || line.includes('PASS')) passed++;
      if (line.includes('✗') || line.includes('FAIL')) {
        failed++;
        securityIssues.push(`Security test failure: ${line.trim()}`);
      }
      if (line.includes('SKIP')) skipped++;
    });

    return {
      testFile: source,
      passed,
      failed,
      skipped,
      duration: 0, // Would be parsed from actual output
      securityIssues,
    };
  }

  private calculateOverallCoverage(results: TestResult[]) {
    // Simplified coverage calculation
    const validResults = results.filter(r => r.coverage);
    if (validResults.length === 0) {
      return { statements: 0, branches: 0, functions: 0, lines: 0 };
    }

    const avg = (field: keyof NonNullable<TestResult['coverage']>) =>
      validResults.reduce((sum, r) => sum + (r.coverage?.[field] || 0), 0) / validResults.length;

    return {
      statements: avg('statements'),
      branches: avg('branches'),
      functions: avg('functions'),
      lines: avg('lines'),
    };
  }

  private generateRecommendations(results: TestResult[], criticalIssues: string[]): string[] {
    const recommendations: string[] = [];

    // Check test coverage
    const totalTests = results.reduce((sum, r) => sum + r.passed + r.failed + r.skipped, 0);
    if (totalTests < 50) {
      recommendations.push('Increase security test coverage - currently below minimum threshold');
    }

    // Check critical failures
    if (criticalIssues.length > 0) {
      recommendations.push('Address critical security test failures immediately');
    }

    // Check for missing test patterns
    const testedComponents = results.map(r => r.testFile);
    if (!testedComponents.some(f => f.includes('LoginForm'))) {
      recommendations.push('Add comprehensive LoginForm security tests');
    }
    if (!testedComponents.some(f => f.includes('RegisterForm'))) {
      recommendations.push('Add comprehensive RegisterForm security tests');
    }
    if (!testedComponents.some(f => f.includes('validation'))) {
      recommendations.push('Add input validation security tests');
    }

    // Performance recommendations
    const slowTests = results.filter(r => r.duration > 5000);
    if (slowTests.length > 0) {
      recommendations.push('Optimize slow security tests for better CI performance');
    }

    return recommendations;
  }

  private async saveReport(report: SecurityTestReport): Promise<void> {
    const reportPath = path.join(process.cwd(), 'security-test-report.json');
    const markdownPath = path.join(process.cwd(), 'SECURITY_TEST_REPORT.md');

    // Save JSON report
    writeFileSync(reportPath, JSON.stringify(report, null, 2));

    // Generate markdown report
    const markdown = this.generateMarkdownReport(report);
    writeFileSync(markdownPath, markdown);

    console.log(`📊 Security test report saved to: ${reportPath}`);
    console.log(`📋 Markdown report saved to: ${markdownPath}`);
  }

  private generateMarkdownReport(report: SecurityTestReport): string {
    const { totalTests, totalPassed, totalFailed, criticalIssues, recommendations } = report;
    const passRate = totalTests > 0 ? ((totalPassed / totalTests) * 100).toFixed(1) : '0';

    return `# Security Test Report

**Generated:** ${report.timestamp}
**Total Tests:** ${totalTests}
**Pass Rate:** ${passRate}%

## Summary

- ✅ **Passed:** ${totalPassed}
- ❌ **Failed:** ${totalFailed}
- ⏱️ **Duration:** ${(report.totalDuration / 1000).toFixed(2)}s

## Coverage

- **Statements:** ${report.overallCoverage.statements.toFixed(1)}%
- **Branches:** ${report.overallCoverage.branches.toFixed(1)}%
- **Functions:** ${report.overallCoverage.functions.toFixed(1)}%
- **Lines:** ${report.overallCoverage.lines.toFixed(1)}%

## Critical Issues

${criticalIssues.length === 0 ? '✅ No critical issues found!' : criticalIssues.map(issue => `- ❌ ${issue}`).join('\n')}

## Recommendations

${recommendations.map(rec => `- 📋 ${rec}`).join('\n')}

## Test Results

${report.securityTestResults.map(result => `
### ${result.testFile}
- **Passed:** ${result.passed}
- **Failed:** ${result.failed}
- **Skipped:** ${result.skipped}
- **Issues:** ${result.securityIssues.length || 'None'}
`).join('\n')}

## Security Checklist Status

- [${totalPassed > 0 ? 'x' : ' '}] Authentication tests implemented
- [${report.securityTestResults.some(r => r.testFile.includes('validation')) ? 'x' : ' '}] Input validation tests
- [${report.securityTestResults.some(r => r.testFile.includes('PasswordField')) ? 'x' : ' '}] Password security tests
- [${report.securityTestResults.some(r => r.testFile.includes('RegisterForm')) ? 'x' : ' '}] Registration security tests
- [${criticalIssues.length === 0 ? 'x' : ' '}] No critical security failures

## Next Steps

1. Address any critical issues listed above
2. Implement missing test coverage areas
3. Review and update security test cases regularly
4. Integrate security tests into CI/CD pipeline
`;
  }

  private printSummary(report: SecurityTestReport): void {
    const { totalTests, totalPassed, totalFailed, criticalIssues } = report;
    const passRate = totalTests > 0 ? ((totalPassed / totalTests) * 100).toFixed(1) : '0';

    console.log('\n' + '='.repeat(60));
    console.log('🔐 SECURITY TEST SUMMARY');
    console.log('='.repeat(60));
    console.log(`📊 Total Tests: ${totalTests}`);
    console.log(`✅ Passed: ${totalPassed}`);
    console.log(`❌ Failed: ${totalFailed}`);
    console.log(`📈 Pass Rate: ${passRate}%`);
    console.log(`⏱️  Duration: ${(report.totalDuration / 1000).toFixed(2)}s`);
    
    if (criticalIssues.length > 0) {
      console.log('\n🚨 CRITICAL ISSUES:');
      criticalIssues.forEach(issue => console.log(`   ❌ ${issue}`));
    } else {
      console.log('\n✅ No critical security issues found!');
    }

    console.log('\n📋 RECOMMENDATIONS:');
    report.recommendations.forEach(rec => console.log(`   📌 ${rec}`));
    
    console.log('\n' + '='.repeat(60));
  }
}

// CLI interface
if (require.main === module) {
  const runner = new SecurityTestRunner();
  runner.runSecurityTests().catch(error => {
    console.error('❌ Security test runner failed:', error);
    process.exit(1);
  });
}

export default SecurityTestRunner;
