package com.github.namagomi.github

import com.github.namagomi._
import io.circe.Decoder
import io.circe.generic.semiauto.deriveDecoder
import sttp.client3._
import sttp.client3.circe._

object Github {
  private val backend: SttpBackend[Identity, Any] = HttpClientSyncBackend()

  private implicit val decoder: Decoder[List[NamagomiModResponse]] = deriveDecoder

  def getModList(url: String): Either[ResponseException[String, io.circe.Error], List[NamagomiModData]] = {
    val response = basicRequest
      .get(uri"$url")
      .response(asJson[List[NamagomiModResponse]])
      .send(backend)

    response.body match {
      case Right(value) =>
        Right(value.map(i =>
          (i.directUrl, i.modId, i.fileId) match {
            case (Some(directUrl), _, _) =>
              HasDownloadUrl(
                i.name,
                directUrl,
                i.side
              )
            case (_, Some(modId), Some(fileId)) =>
              HasNotDownloadUrl(
                i.name,
                modId,
                fileId,
                i.side
              )
          }))
      case Left(e) => Left(e)
    }
  }
}
