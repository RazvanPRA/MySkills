package com.razvanprajanu.seniorprep.files

import android.app.Activity
import android.content.Intent
import android.net.Uri
import com.facebook.react.bridge.ActivityEventListener
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReadableArray
import com.razvanprajanu.seniorprep.specs.NativeDataFilesSpec
import java.io.ByteArrayOutputStream
import java.io.IOException
import java.util.concurrent.ExecutorService
import java.util.concurrent.Executors

/**
 * Backup files through the Storage Access Framework: the user picks where to save (Drive,
 * Downloads...) and which file to open. No storage permission is needed.
 */
class DataFilesModule(private val context: ReactApplicationContext) :
  NativeDataFilesSpec(context), ActivityEventListener {

  private data class Pending(val requestCode: Int, val promise: Promise, val text: String?)

  private var pending: Pending? = null
  private val io: ExecutorService = Executors.newSingleThreadExecutor()

  init {
    context.addActivityEventListener(this)
  }

  override fun getName(): String = NAME

  override fun saveText(fileName: String, mimeType: String, text: String, promise: Promise) {
    val intent =
      Intent(Intent.ACTION_CREATE_DOCUMENT)
        .addCategory(Intent.CATEGORY_OPENABLE)
        .setType(mimeType)
        .putExtra(Intent.EXTRA_TITLE, fileName)
    start(intent, Pending(REQUEST_SAVE, promise, text))
  }

  override fun openText(mimeTypes: ReadableArray, promise: Promise) {
    val types = (0 until mimeTypes.size()).mapNotNull { mimeTypes.getString(it) }.toTypedArray()
    val intent =
      Intent(Intent.ACTION_OPEN_DOCUMENT)
        .addCategory(Intent.CATEGORY_OPENABLE)
        .setType("*/*")
        .putExtra(Intent.EXTRA_MIME_TYPES, types)
    start(intent, Pending(REQUEST_OPEN, promise, null))
  }

  private fun start(intent: Intent, request: Pending) {
    val activity = reactApplicationContext.currentActivity
    if (activity == null) {
      request.promise.reject(ERROR_NO_ACTIVITY, "No activity to show the file dialog")
      return
    }
    // A second request while a dialog is open replaces the first one, which resolves as cancelled.
    pending?.let { cancelled(it) }
    pending = request
    activity.startActivityForResult(intent, request.requestCode)
  }

  override fun onActivityResult(activity: Activity, requestCode: Int, resultCode: Int, data: Intent?) {
    val request = pending?.takeIf { it.requestCode == requestCode } ?: return
    pending = null
    val uri = data?.data
    if (resultCode != Activity.RESULT_OK || uri == null) {
      cancelled(request)
      return
    }
    io.execute {
      try {
        if (requestCode == REQUEST_SAVE) {
          write(uri, request.text.orEmpty())
          request.promise.resolve(true)
        } else {
          request.promise.resolve(read(uri))
        }
      } catch (error: Exception) {
        request.promise.reject(ERROR_IO, error.message, error)
      }
    }
  }

  override fun onNewIntent(intent: Intent) = Unit

  private fun cancelled(request: Pending) =
    request.promise.resolve(if (request.requestCode == REQUEST_SAVE) false else null)

  private fun write(uri: Uri, text: String) {
    val stream = context.contentResolver.openOutputStream(uri, "wt") ?: throw IOException("Cannot write $uri")
    stream.use { it.write(text.toByteArray(Charsets.UTF_8)) }
  }

  private fun read(uri: Uri): String {
    val stream = context.contentResolver.openInputStream(uri) ?: throw IOException("Cannot read $uri")
    // minSdk 24: no InputStream.readNBytes, so copy in chunks and stop past the limit.
    return stream.use { input ->
      val output = ByteArrayOutputStream()
      val buffer = ByteArray(BUFFER_BYTES)
      while (true) {
        val read = input.read(buffer)
        if (read < 0) break
        output.write(buffer, 0, read)
        if (output.size() > MAX_BYTES) throw IOException("File is larger than $MAX_BYTES bytes")
      }
      output.toString(Charsets.UTF_8.name())
    }
  }

  override fun invalidate() {
    context.removeActivityEventListener(this)
    io.shutdown()
    super.invalidate()
  }

  companion object {
    const val NAME = "DataFiles"
    private const val REQUEST_SAVE = 41_001
    private const val REQUEST_OPEN = 41_002
    /** A backup of years of daily tests is a few MB; anything far larger is not ours. */
    private const val MAX_BYTES = 32 * 1024 * 1024
    private const val BUFFER_BYTES = 64 * 1024
    private const val ERROR_NO_ACTIVITY = "E_NO_ACTIVITY"
    private const val ERROR_IO = "E_IO"
  }
}
