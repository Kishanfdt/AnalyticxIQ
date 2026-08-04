import { useState } from 'react';
import { loginSchema } from '@analyticiq/shared';

function App() {
  const [email, setEmail] = useState('');
  const [validationMessage, setValidationMessage] = useState('');

  const handleTestValidate = () => {
    // Validate email input using Zod loginSchema from our @analyticiq/shared package
    const result = loginSchema.safeParse({ email, password: 'password123' });
    if (result.success) {
      setValidationMessage('✅ Shared validation passed: Email format is correct.');
    } else {
      const error = result.error.errors[0]?.message || 'Validation failed';
      setValidationMessage(`❌ Shared validation failed: ${error}`);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-[#09090b] flex items-center justify-center p-6">
      <div className="bg-white dark:bg-[#0c0c0f] border border-zinc-200 dark:border-zinc-800 rounded-xl p-8 max-w-md w-full shadow-sm">
        <h1 className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-50 tracking-tight mb-2">
          AnalyticxIQ Setup
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400 text-sm mb-6">
          The monorepo workspaces and compilation layers have been configured. Test the shared Zod
          schema validation below.
        </p>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">
              Test Email Input
            </label>
            <input
              type="text"
              placeholder="e.g. name@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#ffffff] dark:bg-[#09090b] border border-zinc-200 dark:border-zinc-800 rounded-[8px] px-[12px] py-[8px] text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 text-zinc-950 dark:text-zinc-100 transition-all"
            />
          </div>

          <button
            onClick={handleTestValidate}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-[8px] px-[16px] py-[8px] font-medium transition-colors shadow-sm text-sm"
          >
            Validate using Shared Package
          </button>

          {validationMessage && (
            <div
              className={`text-xs p-3 rounded-lg border font-mono ${
                validationMessage.startsWith('✅')
                  ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/30 text-emerald-800 dark:text-emerald-400'
                  : 'bg-rose-50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-800/30 text-rose-800 dark:text-rose-400'
              }`}
            >
              {validationMessage}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
