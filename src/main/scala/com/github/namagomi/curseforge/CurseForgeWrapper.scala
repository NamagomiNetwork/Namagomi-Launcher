package com.github.namagomi.curseforge

import com.github.namagomi.Config.{curseForgeApiKey, curseForgeUrl}
import com.github.namagomi.{HasDownloadUrl, HasNotDownloadUrl, NamagomiModData}
import io.circe.generic.semiauto._
import io.circe.{Decoder, Encoder}
import sttp.client3._
import sttp.client3.circe._
import sttp.model.Uri

object CurseForgeWrapper {
  private val curseForgeHeaders = Map(
    "Accept" -> "application/json",
    "x-api-key" -> curseForgeApiKey
  )

  val backend: SttpBackend[Identity, Any] = HttpClientSyncBackend()

  implicit val encoder: Encoder[CurseForgeResponse] = deriveEncoder
  implicit val decoder: Decoder[CurseForgeResponse] = deriveDecoder

  def getModFileUrl(namagomiMod: NamagomiModData): Either[ResponseException[String, io.circe.Error],NamagomiModResponse] = {
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
          case Right(value)=>
            Right(NamagomiModResponse(
              side,
              value.fileName,
              value.downloadUrl,
              Some(value.hashes)
            ))
          case Left(value)=>
            Left(value)
        }
    }
  }

  def getFileName(url: String): String = {
    "TODO: urlからファイル名を取得" //TODO: urlからファイル名を取得
  }
}
