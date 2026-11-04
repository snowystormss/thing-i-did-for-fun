package com.lilly.bot.domain.model

enum class CompanionMode {
    AWAKE,
    SLEEP_INERTIA,
    DREAMING,
    DEEP_SLEEP
}

data class LillyCompanionState(
    val mode: CompanionMode = CompanionMode.AWAKE,
    val lastActiveTimestamp: Long = System.currentTimeMillis(),
    val sleepStartTime: Long? = null,
    val inertiaWakingStartTime: Long? = null,
    val currentTopic: String = "",
    val isStreaming: Boolean = false,
    val streamBuffer: String = "",
    val activeToolCount: Int = 0
) {
    val isInert: Boolean
        get() = mode == CompanionMode.SLEEP_INERTIA

    val isSleeping: Boolean
        get() = mode == CompanionMode.DREAMING || mode == CompanionMode.DEEP_SLEEP
}
