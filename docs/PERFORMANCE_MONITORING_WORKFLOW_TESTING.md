# VS Code Performance Monitoring & Workflow Testing Guide

## Step 2: Monitor Performance Using Built-in Performance Monitor

### 🔍 Performance Monitoring Commands

#### Check Extension Host Performance

1. **Open Command Palette**: `Ctrl+Shift+P`
2. **Run**: `Developer: Show Running Extensions`
3. **Look For**:
   - ✅ All extensions showing "Enabled" status
   - ❌ No extensions showing "Unresponsive" or "Performance Issue"
   - ⏱️ Reasonable activation times (<1000ms)

#### Startup Performance Analysis

1. **Open Command Palette**: `Ctrl+Shift+P`
2. **Run**: `Developer: Startup Performance`
3. **Monitor**:
   - Total startup time
   - Extension activation times
   - Extension host startup time

#### Extension Performance Details

1. **Open Command Palette**: `Ctrl+Shift+P`
2. **Run**: `Developer: Reload Window With Extensions Disabled`
3. **Compare**: Startup time with/without extensions
4. **Re-enable**: Restart normally to restore extensions

### 📊 Performance Metrics to Monitor

#### Acceptable Performance Ranges

- **Startup Time**: <3-5 seconds
- **Extension Activation**: <1 second per extension
- **TypeScript Response**: <2 seconds for IntelliSense
- **ESLint Validation**: <1 second for medium files
- **Git Operations**: <500ms for status checks

#### Warning Signs

- ⚠️ Extensions showing "Unresponsive"
- ⚠️ High CPU usage (>50%) during idle
- ⚠️ Memory usage continuously growing
- ⚠️ Slow typing response (>100ms lag)

## Step 3: Test Development Workflow

### 🧪 Core Functionality Tests

#### 1. TypeScript IntelliSense Test

**File**: Create/Open `test-workflow.ts`

```typescript
// Test TypeScript IntelliSense
interface TestInterface {
  name: string;
  value: number;
}

const testObj: TestInterface = {
  // Should show autocomplete for 'name' and 'value'
}

// Test error detection
const invalidObj: TestInterface = {
  // Should show red underlines for missing properties
}
```

**Expected Results**:

- ✅ Autocomplete suggestions appear quickly (<2s)
- ✅ Error underlines show for invalid code
- ✅ Hover information displays type details
- ✅ Go to definition works (F12)

#### 2. ESLint Integration Test

**File**: Test in existing `.ts` file

```typescript
// Add intentional ESLint violations
var unusedVariable = "test";  // Should show warning
console.log("test")          // Should show semicolon error
```

**Expected Results**:

- ✅ ESLint errors show inline (red underlines)
- ✅ Error Lens displays messages inline
- ✅ Problems panel shows ESLint issues
- ✅ Quick fixes available (lightbulb icon)

#### 3. Tailwind CSS Test

**File**: Test in `.tsx` component

```tsx
// Test Tailwind IntelliSense
<div className="bg-blue-500 text-white p-4 rounded-lg hover:bg-blue-600">
  {/* Should show Tailwind class suggestions */}
</div>
```

**Expected Results**:

- ✅ Tailwind class autocomplete works
- ✅ Color previews show for color classes
- ✅ Class validation (warnings for invalid classes)
- ✅ Hover shows CSS values

#### 4. Prettier Formatting Test

**File**: Create messy formatting

```typescript
// Messy formatting test
const   test={name:"John",age:30,items:[1,2,3]};
function badFormat(  param1:string,param2:number  ){return param1+param2;}
```

**Action**: Right-click → "Format Document" or `Shift+Alt+F`

**Expected Results**:

- ✅ Code formats according to `.prettierrc` rules
- ✅ Single quotes, semicolons, proper spacing
- ✅ Consistent indentation applied

#### 5. Git Integration Test

**Actions**:

- Make a small change to any file
- Check Git status in Source Control panel
- Stage/unstage changes

**Expected Results**:

- ✅ Changed files appear in Source Control
- ✅ Diff view works correctly
- ✅ No performance lag during Git operations
- ✅ File decorations show correctly (if enabled)

#### 6. Error Lens Display Test

**File**: Add code with errors

```typescript
// Test Error Lens
const test: string = 123;  // Type error
undefinedFunction();       // Reference error
```

**Expected Results**:

- ✅ Inline error messages appear with 500ms delay
- ✅ Messages are concise (<200 characters)
- ✅ Error and warning levels display correctly
- ✅ Gutter icons show for problems

### 🎯 Performance Validation Checklist

#### CPU Usage Test (Task Manager)

- [ ] **Idle State**: VS Code CPU usage <5%
- [ ] **Active Coding**: CPU usage <20%
- [ ] **Heavy Operations**: CPU spikes resolve quickly (<30s)

#### Memory Usage Test

- [ ] **Initial Load**: Memory usage reasonable (<500MB)
- [ ] **Extended Use**: No continuous memory growth
- [ ] **Large Files**: Memory usage stable when opening large files

#### Responsiveness Test

- [ ] **Typing**: No noticeable lag during typing
- [ ] **File Switching**: Quick file tab switching (<200ms)
- [ ] **IntelliSense**: Suggestions appear promptly
- [ ] **Extension Operations**: No freezing during extension actions

## Step 4: Adjust Settings If Needed

### 🔧 Common Adjustments Based on Workflow Needs

#### If You Need More IntelliSense Features

```json
// Add to .vscode/settings.json
"typescript.suggest.autoImports": true,
"typescript.suggest.completeFunctionCalls": true,
"editor.quickSuggestions": {
    "other": "on",
    "comments": "off", 
    "strings": "off"
}
```

#### If You Need Code Lens Features

```json
"typescript.referencesCodeLens.enabled": true,
"typescript.implementationsCodeLens.enabled": true,
"editor.codeLens": true
```

#### If You Need Prettier Auto-Format

```json
"editor.formatOnSave": true,
"editor.defaultFormatter": "esbenp.prettier-vscode"
```

#### If You Need More Git Features

```json
"git.decorations.enabled": true,
"git.autorefresh": true,
"git.timeline.showUncommitted": true
```

#### If Performance Issues Persist

```json
// Emergency performance mode
"typescript.disableAutomaticTypeAcquisition": true,
"typescript.suggest.enabled": false,
"editor.wordBasedSuggestions": "off",
"files.watcherExclude": {
    "**": true  // Disable all file watching
}
```

### 🚨 Troubleshooting Common Issues

#### Extension Not Working

1. Check extension is enabled
2. Reload window (`Ctrl+Shift+P` → "Developer: Reload Window")
3. Check extension output logs
4. Restart extension host (`Ctrl+Shift+P` → "Developer: Restart Extension Host")

#### Performance Still Poor

1. Disable extensions one by one to identify culprit
2. Clear extension cache: Close VS Code, delete `.vscode` folders in user directory
3. Reset to default settings and reapply optimizations gradually

#### IntelliSense Not Working

1. Verify TypeScript version: `Ctrl+Shift+P` → "TypeScript: Select TypeScript Version"
2. Restart TypeScript service: `Ctrl+Shift+P` → "TypeScript: Restart TS Server"
3. Check `tsconfig.json` is valid

### ✅ Success Criteria

**Workflow is optimized when**:

- [ ] VS Code starts in <5 seconds
- [ ] All extensions show "Enabled" status
- [ ] TypeScript IntelliSense responds in <2 seconds
- [ ] ESLint validation happens smoothly
- [ ] Tailwind autocomplete works reliably
- [ ] Error Lens shows issues inline
- [ ] Prettier formats code correctly
- [ ] Git operations are responsive
- [ ] No extension performance warnings
- [ ] CPU usage remains reasonable during coding

**If criteria not met**: Refer to adjustment sections above or escalate for further optimization.

## Next Steps After Workflow Testing

1. **Monitor for 24-48 hours**: Ensure stability during normal development
2. **Team feedback**: Gather input on any missing functionality
3. **Gradual feature re-enabling**: Add back features as needed with performance monitoring
4. **Documentation updates**: Update team guidelines based on working configuration
