package com.lilly.bot.domain.brain

import com.lilly.bot.domain.model.CompanionMode
import com.lilly.bot.domain.model.LillyCompanionState

class SleepStateMachine(
    var idleSortAfterMinutes: Int = 5,
    var dreamShutdownMinutes: Int = 30,
    var contextTimeoutSeconds: Int = 1800,
    var sleepInertiaDurationSeconds: Int = 45
) {
    private var state = LillyCompanionState(mode = CompanionMode.AWAKE)

    fun getCurrentState(): LillyCompanionState = state

    /**
     * Called whenever user sends a message or interacts with Lilly.
     * Evaluates whether she was asleep, experiencing sleep inertia, or active.
     */
    fun onUserMessageReceived(now: Long = System.currentTimeMillis()): WakeEventResult {
        val previousMode = state.mode
        val elapsedSinceActive = (now - state.lastActiveTimestamp) / 1000

        val contextTimedOut = elapsedSinceActive >= contextTimeoutSeconds

        val result = when (previousMode) {
            CompanionMode.AWAKE -> {
                if (contextTimedOut) {
                    WakeEventResult(
                        shouldResetContext = true,
                        wasInterrupted = false,
                        wakingPromptPrefix = ""
                    )
                } else {
                    WakeEventResult(
                        shouldResetContext = false,
                        wasInterrupted = false,
                        wakingPromptPrefix = ""
                    )
                }
            }
            CompanionMode.SLEEP_INERTIA -> {
                // Already in waking process
                val inertiaElapsed = (now - (state.inertiaWakingStartTime ?: now)) / 1000
                if (inertiaElapsed >= sleepInertiaDurationSeconds) {
                    state = state.copy(mode = CompanionMode.AWAKE, inertiaWakingStartTime = null)
                }
                WakeEventResult(
                    shouldResetContext = false,
                    wasInterrupted = true,
                    wakingPromptPrefix = "[System note: Lilly is waking up and experiencing slight sleep inertia. Respond naturally as someone rubbing sleep from their eyes.]"
                )
            }
            CompanionMode.DREAMING, CompanionMode.DEEP_SLEEP -> {
                // Interrupted from sleep! Enter SLEEP_INERTIA
                state = state.copy(
                    mode = CompanionMode.SLEEP_INERTIA,
                    inertiaWakingStartTime = now,
                    sleepStartTime = null
                )
                WakeEventResult(
                    shouldResetContext = contextTimedOut,
                    wasInterrupted = true,
                    wakingPromptPrefix = if (previousMode == CompanionMode.DREAMING) {
                        "[System note: Lilly was mid-dream/reflecting when the user suddenly spoke. Wake up with gentle surprise or slight disorientation.]"
                    } else {
                        "[System note: Lilly was in deep sleep and is waking up. Acknowledge waking up naturally.]"
                    }
                )
            }
        }

        state = state.copy(
            lastActiveTimestamp = now
        )
        return result
    }

    /**
     * Periodic evaluation check (called by background service or timer).
     */
    fun evaluateIdleTick(now: Long = System.currentTimeMillis()): TransitionEvent? {
        val idleSeconds = (now - state.lastActiveTimestamp) / 1000

        when (state.mode) {
            CompanionMode.AWAKE -> {
                if (idleSeconds >= idleSortAfterMinutes * 60) {
                    state = state.copy(
                        mode = CompanionMode.DREAMING,
                        sleepStartTime = now
                    )
                    return TransitionEvent.ENTERED_DREAMING
                }
            }
            CompanionMode.SLEEP_INERTIA -> {
                val inertiaElapsed = (now - (state.inertiaWakingStartTime ?: now)) / 1000
                if (inertiaElapsed >= sleepInertiaDurationSeconds) {
                    state = state.copy(
                        mode = CompanionMode.AWAKE,
                        inertiaWakingStartTime = null
                    )
                    return TransitionEvent.WOKE_FULL_ALERT
                }
            }
            CompanionMode.DREAMING -> {
                val dreamSeconds = (now - (state.sleepStartTime ?: now)) / 1000
                if (dreamSeconds >= dreamShutdownMinutes * 60) {
                    state = state.copy(mode = CompanionMode.DEEP_SLEEP)
                    return TransitionEvent.ENTERED_DEEP_SLEEP
                }
            }
            CompanionMode.DEEP_SLEEP -> {
                // Stays in deep sleep until user message
            }
        }
        return null
    }

    fun forceState(newMode: CompanionMode) {
        state = state.copy(mode = newMode)
    }

    data class WakeEventResult(
        val shouldResetContext: Boolean,
        val wasInterrupted: Boolean,
        val wakingPromptPrefix: String
    )

    enum class TransitionEvent {
        ENTERED_DREAMING,
        ENTERED_DEEP_SLEEP,
        WOKE_FULL_ALERT
    }
}
