# Proguard rules for Lilly AI Companion
-keep class com.lilly.bot.domain.model.** { *; }
-keepattributes *Annotation*
-dontwarn okhttp3.**
-dontwarn okio.**
