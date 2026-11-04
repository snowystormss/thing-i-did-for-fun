package com.lilly.bot.service

import android.content.Context
import androidx.work.CoroutineWorker
import androidx.work.WorkerParameters
import com.lilly.bot.data.memory.FileMemoryRepository
import com.lilly.bot.data.memory.MemoryPruner
import com.lilly.bot.data.storage.SettingsRepository
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.withContext

class DreamSyncWorker(
    appContext: Context,
    workerParams: WorkerParameters
) : CoroutineWorker(appContext, workerParams) {

    override suspend fun doWork(): Result = withContext(Dispatchers.IO) {
        try {
            val repository = FileMemoryRepository(applicationContext)
            val pruner = MemoryPruner(repository)
            val settingsRepo = SettingsRepository(applicationContext)
            val settings = settingsRepo.settingsFlow.first()

            // Run retention & size limit pruning
            val report = pruner.runPrune(settings)

            Result.success()
        } catch (e: Exception) {
            Result.retry()
        }
    }

    companion object {
        const val WORK_NAME = "lilly_dream_sync_work"
    }
}
