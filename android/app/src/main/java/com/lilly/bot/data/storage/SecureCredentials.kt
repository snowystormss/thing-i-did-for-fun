package com.lilly.bot.data.storage

import android.content.Context
import android.content.SharedPreferences
import androidx.security.crypto.EncryptedSharedPreferences
import androidx.security.crypto.MasterKey

class SecureCredentials(context: Context) {

    private val sharedPreferences: SharedPreferences

    init {
        val masterKey = MasterKey.Builder(context)
            .setKeyScheme(MasterKey.KeyScheme.AES256_GCM)
            .build()

        sharedPreferences = EncryptedSharedPreferences.create(
            context,
            "lilly_secure_prefs",
            masterKey,
            EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
            EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM
        )
    }

    var apiKey: String
        get() = sharedPreferences.getString(KEY_API_KEY, "") ?: ""
        set(value) = sharedPreferences.edit().putString(KEY_API_KEY, value).apply()

    var cloudSearchApiKey: String
        get() = sharedPreferences.getString(KEY_CLOUD_SEARCH_API_KEY, "") ?: ""
        set(value) = sharedPreferences.edit().putString(KEY_CLOUD_SEARCH_API_KEY, value).apply()

    fun getEffectiveCloudApiKey(): String {
        val cloudKey = cloudSearchApiKey.trim()
        return if (cloudKey.isNotEmpty()) cloudKey else apiKey.trim()
    }

    companion object {
        private const val KEY_API_KEY = "api_key"
        private const val KEY_CLOUD_SEARCH_API_KEY = "cloud_search_api_key"
    }
}
