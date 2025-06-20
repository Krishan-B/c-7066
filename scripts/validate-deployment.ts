/**
 * Trading Engine Deployment Status Checker
 * Run this script to validate your Trading Engine deployment
 * Date: June 19, 2025
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

// Load environment variables
config();

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://hntsrkacolpseqnyidis.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || '';

interface TestResult {
  test: string;
  status: 'PASS' | 'FAIL' | 'SKIP';
  message: string;
  details?: any;
}

class TradingEngineValidator {
  private supabase: any;
  private results: TestResult[] = [];

  constructor() {
    if (SUPABASE_ANON_KEY && !SUPABASE_ANON_KEY.includes('_here')) {
      this.supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    }
  }

  private addResult(
    test: string,
    status: 'PASS' | 'FAIL' | 'SKIP',
    message: string,
    details?: any
  ) {
    this.results.push({ test, status, message, details });
  }

  async validateEnvironment(): Promise<void> {
    console.log('🔍 Validating Environment Configuration...\n');

    // Check Supabase URL
    if (SUPABASE_URL && SUPABASE_URL !== 'your_supabase_url_here') {
      this.addResult('Supabase URL', 'PASS', `Configured: ${SUPABASE_URL}`);
    } else {
      this.addResult('Supabase URL', 'FAIL', 'Supabase URL not configured in .env file');
    }

    // Check Supabase Anon Key
    if (SUPABASE_ANON_KEY && !SUPABASE_ANON_KEY.includes('_here')) {
      this.addResult(
        'Supabase Anon Key',
        'PASS',
        `Configured (${SUPABASE_ANON_KEY.substring(0, 20)}...)`
      );
    } else {
      this.addResult('Supabase Anon Key', 'FAIL', 'Supabase Anon Key not configured in .env file');
    }

    // Check Security Keys
    const jwtSecret = process.env.JWT_SECRET;
    if (jwtSecret && !jwtSecret.includes('_here') && jwtSecret.length >= 32) {
      this.addResult('JWT Secret', 'PASS', `Configured (${jwtSecret.length} characters)`);
    } else {
      this.addResult(
        'JWT Secret',
        'FAIL',
        'JWT Secret not properly configured (minimum 32 characters required)'
      );
    }

    const encryptionKey = process.env.ENCRYPTION_KEY;
    if (encryptionKey && !encryptionKey.includes('_here') && encryptionKey.length >= 32) {
      this.addResult('Encryption Key', 'PASS', `Configured (${encryptionKey.length} characters)`);
    } else {
      this.addResult(
        'Encryption Key',
        'FAIL',
        'Encryption Key not properly configured (32 characters required)'
      );
    }
  }

  async validateSupabaseConnection(): Promise<void> {
    console.log('🌐 Validating Supabase Connection...\n');

    if (!this.supabase) {
      this.addResult('Supabase Connection', 'SKIP', 'Supabase credentials not configured');
      return;
    }

    try {
      // Test basic connection
      const { data, error } = await this.supabase.from('user_account').select('count').limit(1);

      if (error && error.code === 'PGRST116') {
        // Table not found - might be normal if migrations not run
        this.addResult(
          'Supabase Connection',
          'PASS',
          'Connected successfully (some tables may not exist yet)'
        );
      } else if (error) {
        this.addResult('Supabase Connection', 'FAIL', `Connection error: ${error.message}`, error);
      } else {
        this.addResult('Supabase Connection', 'PASS', 'Connected successfully');
      }
    } catch (error) {
      this.addResult('Supabase Connection', 'FAIL', `Connection failed: ${error}`, error);
    }
  }

  async validateDatabaseSchema(): Promise<void> {
    console.log('🗄️ Validating Database Schema...\n');

    if (!this.supabase) {
      this.addResult('Database Schema', 'SKIP', 'Supabase credentials not configured');
      return;
    }

    const tables = [
      'user_account',
      'user_portfolio',
      'user_trades',
      'orders',
      'positions',
      'position_history',
      'trade_analytics',
      'risk_metrics',
    ];

    for (const table of tables) {
      try {
        const { data, error } = await this.supabase.from(table).select('*').limit(1);

        if (error && error.code === 'PGRST116') {
          this.addResult(
            `Table: ${table}`,
            'FAIL',
            'Table does not exist - run database migrations'
          );
        } else if (error) {
          this.addResult(`Table: ${table}`, 'FAIL', `Access error: ${error.message}`);
        } else {
          this.addResult(`Table: ${table}`, 'PASS', 'Table exists and is accessible');
        }
      } catch (error) {
        this.addResult(`Table: ${table}`, 'FAIL', `Validation failed: ${error}`);
      }
    }
  }

  async validateEdgeFunctions(): Promise<void> {
    console.log('⚡ Validating Edge Functions...\n');

    if (!SUPABASE_ANON_KEY || SUPABASE_ANON_KEY.includes('_here')) {
      this.addResult('Edge Functions', 'SKIP', 'Supabase credentials not configured');
      return;
    }

    const functions = ['trading-engine', 'risk-management'];

    for (const functionName of functions) {
      try {
        const response = await fetch(`${SUPABASE_URL}/functions/v1/${functionName}`, {
          method: 'OPTIONS',
          headers: {
            Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.status === 200 || response.status === 204) {
          this.addResult(
            `Function: ${functionName}`,
            'PASS',
            'Function is deployed and accessible'
          );
        } else if (response.status === 404) {
          this.addResult(`Function: ${functionName}`, 'FAIL', 'Function not deployed yet');
        } else {
          this.addResult(
            `Function: ${functionName}`,
            'FAIL',
            `Unexpected response: ${response.status}`
          );
        }
      } catch (error) {
        this.addResult(`Function: ${functionName}`, 'FAIL', `Validation failed: ${error}`);
      }
    }
  }

  async validateFunctionAuthentication(): Promise<void> {
    console.log('🔐 Validating Function Authentication...\n');

    if (!SUPABASE_ANON_KEY || SUPABASE_ANON_KEY.includes('_here')) {
      this.addResult('Function Authentication', 'SKIP', 'Supabase credentials not configured');
      return;
    }

    try {
      // Test trading engine without proper auth
      const response = await fetch(`${SUPABASE_URL}/functions/v1/trading-engine`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // No Authorization header
        },
        body: JSON.stringify({ action: 'get_positions' }),
      });

      if (response.status === 401) {
        this.addResult(
          'Function Authentication',
          'PASS',
          'Functions properly require authentication'
        );
      } else if (response.status === 404) {
        this.addResult('Function Authentication', 'SKIP', 'Function not deployed yet');
      } else {
        this.addResult(
          'Function Authentication',
          'FAIL',
          `Functions should require authentication (got ${response.status})`
        );
      }
    } catch (error) {
      this.addResult('Function Authentication', 'FAIL', `Validation failed: ${error}`);
    }
  }

  printResults(): void {
    console.log('\n📊 Deployment Validation Results');
    console.log('================================\n');

    let passed = 0;
    let failed = 0;
    let skipped = 0;

    this.results.forEach((result) => {
      const statusIcon = {
        PASS: '✅',
        FAIL: '❌',
        SKIP: '⏭️',
      }[result.status];

      console.log(`${statusIcon} ${result.test}: ${result.message}`);

      if (result.status === 'PASS') passed++;
      else if (result.status === 'FAIL') failed++;
      else skipped++;
    });

    console.log(`\n📈 Summary: ${passed} passed, ${failed} failed, ${skipped} skipped\n`);

    if (failed > 0) {
      console.log('🔧 Next Steps to Fix Failed Tests:');
      console.log('=================================');

      this.results
        .filter((r) => r.status === 'FAIL')
        .forEach((result) => {
          console.log(`\n❌ ${result.test}:`);
          console.log(`   ${result.message}`);

          // Provide specific guidance
          if (result.test.includes('Supabase')) {
            console.log('   → Update your .env file with actual Supabase credentials');
          } else if (result.test.includes('Table:')) {
            console.log('   → Run database migrations: supabase db push');
          } else if (result.test.includes('Function:')) {
            console.log('   → Deploy edge functions: supabase functions deploy');
          }
        });
    } else if (skipped === this.results.length) {
      console.log('⚠️  All tests were skipped due to missing configuration.');
      console.log('📋 Please configure your .env file with Supabase credentials.');
    } else {
      console.log('🎉 All tests passed! Your Trading Engine deployment looks good!');
    }

    console.log('\n📚 For detailed deployment instructions, see:');
    console.log('   - TRADING_ENGINE_README.md');
    console.log('   - scripts/deploy-trading-engine.sh');
  }

  async run(): Promise<void> {
    console.log('🚀 Trading Engine Deployment Validation');
    console.log('=======================================\n');

    await this.validateEnvironment();
    await this.validateSupabaseConnection();
    await this.validateDatabaseSchema();
    await this.validateEdgeFunctions();
    await this.validateFunctionAuthentication();

    this.printResults();
  }
}

// Run validation if this file is executed directly
const isMainModule = import.meta.url === `file://${process.argv[1]}`;
if (isMainModule) {
  const validator = new TradingEngineValidator();
  validator.run().catch(console.error);
}

export { TradingEngineValidator };
