# Add project specific ProGuard rules here.
# Flags here are appended to proguard-android-optimize.txt and AAR consumer rules
# (react-android ships its own proguard.txt).

# ---- Crashlytics / readable stack traces ----
-keepattributes SourceFile,LineNumberTable
-keepattributes *Annotation*
-keepattributes Signature
-keepattributes EnclosingMethod
-keepattributes InnerClasses
-keep public class * extends java.lang.Exception
-keep class com.google.firebase.crashlytics.** { *; }
-dontwarn com.google.firebase.crashlytics.**

# ---- Reanimated / Fabric ----
-keep class com.swmansion.reanimated.** { *; }
-keep class com.facebook.react.turbomodule.** { *; }
-keep class com.facebook.react.fabric.** { *; }

# ---- SVG ----
-keep public class com.horcrux.svg.** { *; }

# ---- Gesture Handler ----
-keep class com.swmansion.gesturehandler.** { *; }

# ---- Screens ----
-keep class com.swmansion.rnscreens.** { *; }

# ---- Fast Image (Glide) ----
-keep public class * implements com.bumptech.glide.module.GlideModule
-keep class * extends com.bumptech.glide.module.AppGlideModule { *; }
-keep class com.bumptech.glide.** { *; }
-keep public enum com.bumptech.glide.load.resource.bitmap.ImageHeaderParser$** {
  **[] $VALUES;
  public *;
}
-dontwarn com.bumptech.glide.**

# ---- AsyncStorage / Keychain ----
-keep class com.reactnativecommunity.asyncstorage.** { *; }
-keep class com.oblador.keychain.** { *; }
-dontwarn com.oblador.keychain.**

# ---- NetInfo ----
-keep class com.reactnativecommunity.netinfo.** { *; }

# ---- Image Picker ----
-keep class com.imagepicker.** { *; }

# ---- Permissions ----
-keep class com.zoontek.rnpermissions.** { *; }

# ---- Device Info ----
-keep class com.learnium.rnDeviceInfo.** { *; }

# ---- WebView ----
-keep class com.reactnativecommunity.webview.** { *; }

# ---- SSL public key pinning ----
-keep class com.toyberman.** { *; }
-dontwarn com.toyberman.**

# ---- Razorpay ----
-keep class com.razorpay.** { *; }
-dontwarn com.razorpay.**

# ---- Hermes / JNI ----
-keep class com.facebook.jni.** { *; }
-keepclassmembers,includedescriptorclasses class * { native <methods>; }
