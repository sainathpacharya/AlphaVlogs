/**
 * react-native-iap 12.16.2 uses RCTKeyWindow() for StoreKit 2 purchase(confirmIn:).
 * That window is often nil on iPad (Stage Manager / multi-scene), which rejects
 * the purchase with "Could not find window scene" — App Review 2.1(b).
 *
 * Idempotent: safe to run from yarn postinstall and CocoaPods post_install.
 */
const fs = require('fs');
const path = require('path');

const MARKER = 'AlphaVlogs: iPad window scene fallback';

const CURRENT_WINDOW_PATCHED = `@available(iOS 15.0, *)
func currentWindow() async -> UIWindow? {
  // ${MARKER}
  await MainActor.run {
    if let key = RCTKeyWindow() {
      return key
    }
    let scenes = UIApplication.shared.connectedScenes.compactMap { $0 as? UIWindowScene }
    let active = scenes.first { $0.activationState == .foregroundActive } ?? scenes.first
    if let scene = active {
      return scene.windows.first(where: \\.isKeyWindow) ?? scene.windows.first
    }
    return nil
  }
}
`;

function patchCurrentWindow(source) {
  if (source.includes(MARKER) && source.includes('connectedScenes')) {
    return source;
  }

  let next = source;
  if (!/\bimport UIKit\b/.test(next)) {
    next = next.replace(
      'import Foundation\nimport StoreKit\nimport React',
      'import Foundation\nimport StoreKit\nimport UIKit\nimport React',
    );
  }

  const replaced = next.replace(
    /@available\(iOS 15\.0, \*\)\s*func currentWindow\(\) async -> UIWindow\? \{[\s\S]*?\n\}/,
    CURRENT_WINDOW_PATCHED.trimEnd(),
  );
  if (replaced === next && next === source) {
    return null;
  }
  if (replaced === next) {
    return null;
  }
  return replaced;
}

function patchPurchaseSceneGuard(source) {
  if (source.includes(MARKER) && source.includes('if let windowScene')) {
    return source;
  }

  const replaced = source.replace(
    /guard let windowScene = await currentWindow\(\)\?\.windowScene else \{\s*reject\(IapErrors\.E_DEVELOPER_ERROR\.rawValue, "Could not find window scene", nil\)\s*return\s*\}\s*var result: Product\.PurchaseResult\?\s*#if swift\(>=5\.9\)\s*if #available\(iOS 17\.0, tvOS 17\.0, \*\) \{\s*result = try await product\.purchase\(confirmIn: windowScene, options: options\)/,
    `let windowScene = await currentWindow()?.windowScene
    // ${MARKER}

    var result: Product.PurchaseResult?

    #if swift(>=5.9)
      if #available(iOS 17.0, tvOS 17.0, *) {
        if let windowScene {
          result = try await product.purchase(confirmIn: windowScene, options: options)
        } else {
          result = try await product.purchase(options: options)
        }`,
  );
  if (replaced === source) {
    return null;
  }
  return replaced;
}

function writeIfChanged(filePath, next) {
  if (!next) {
    console.warn(`[patch-rn-iap-ipad] expected snippet not found in ${filePath}`);
    return false;
  }
  const before = fs.readFileSync(filePath, 'utf8');
  if (before === next) {
    return true;
  }
  fs.writeFileSync(filePath, next);
  console.log(`[patch-rn-iap-ipad] patched ${filePath}`);
  return true;
}

function resolveCandidates(fileName) {
  return [
    path.join(__dirname, '..', 'node_modules', 'react-native-iap', 'ios', fileName),
    path.join(__dirname, '..', 'ios', 'Pods', 'react-native-iap', 'ios', fileName),
  ];
}

function patchExisting(fileName, transform) {
  let found = false;
  for (const filePath of resolveCandidates(fileName)) {
    if (!fs.existsSync(filePath)) {
      continue;
    }
    found = true;
    const source = fs.readFileSync(filePath, 'utf8').replace(/\r\n/g, '\n');
    writeIfChanged(filePath, transform(source));
  }
  return found;
}

function main() {
  const utilsFound = patchExisting('IapUtils.swift', patchCurrentWindow);
  const sk2Found = patchExisting('RNIapIosSk2.swift', patchPurchaseSceneGuard);

  if (!utilsFound && !sk2Found) {
    console.warn(
      '[patch-rn-iap-ipad] react-native-iap sources not found yet; pod install will retry.',
    );
  }
}

main();
