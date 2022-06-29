package com.github.namagomi.curseforge

import com.github.namagomi.Config.{curseForgeApiKey, curseForgeUrl}
import com.github.namagomi.LocalPaths._
import com.github.namagomi.{HasDownloadUrl, HasNotDownloadUrl, NamagomiModData}
import io.circe.generic.semiauto._
import io.circe.{Decoder, Encoder}
import sttp.client3._
import sttp.client3.circe._
import sttp.model.Uri

import java.nio.file.Paths

object CurseForgeWrapper {
  private val curseForgeHeaders = Map(
    "Accept" -> "application/json",
    "x-api-key" -> curseForgeApiKey
  )

  private val backend: SttpBackend[Identity, Any] = HttpClientSyncBackend()

  private implicit val decoder: Decoder[CurseForgeResponse] = deriveDecoder

  private def getModFileUrl(namagomiMod: NamagomiModData): Either[ResponseException[String, io.circe.Error], NamagomiModResponse] = {
    namagomiMod match {
      case HasDownloadUrl(_, directUrl, side) =>
        Right(NamagomiModResponse(
          side,
          getFileName(directUrl),
          Some(directUrl),
          None,
        ))
      case HasNotDownloadUrl(_, modId, fileId, side) =>
        val getFileUrl = Uri(curseForgeUrl, Seq("v1/mods", modId, "files", fileId))
        val response = basicRequest
          .headers(curseForgeHeaders)
          .post(getFileUrl)
          .response(asJson[CurseForgeResponse])
          .send(backend)

        response.body match {
          case Right(value) =>
            Right(NamagomiModResponse(
              side,
              value.fileName,
              value.downloadUrl,
              Some(value.hashes)
            ))
          case Left(value) =>
            Left(value)
        }
    }
  }

  private def getFileName(url: String): String = {
    url match {
      case "https://web.archive.org/web/20190716014402/http://forum.minecraftuser.jp/download/file.php?id=75930" =>
        "[1.12][forge2413]mod_StorageBox_v3.2.0.zip"
      case _ =>
        url.split("/").last.split("\\?").head.split('#').head
    }
  }

  private def downloadModFile(namagomiMod: NamagomiModResponse): Unit = {
    val file = Paths.get(modsDir(namagomiMod.side), namagomiMod.fileName).toFile
    namagomiMod.downloadUrl match {
      case Some(url) if !file.exists() =>
        basicRequest
          .get(uri"$url")
          .response(asFile(file))
          .send(backend)
          .body match {
          case Left(value) =>
            println(s"[ERROR] $value")
        }
      case _ =>
        println(s"${namagomiMod.fileName} hasn't download url")
    }
  }

  def downloadModFiles(side: String): Unit = {

  }
}
