package com.github.namagomi.main.github

import com.github.namagomi.main.{HasDownloadUrl, HasNotDownloadUrl, NamagomiModData, Unexpected}
import io.circe.generic.auto._
import sttp.client3._
import sttp.client3.circe._

object Github {
  private val backend: SttpBackend[Identity, Any] = HttpClientSyncBackend()

  def getModList(url: String): List[NamagomiModData] = {
    val response = basicRequest
      .get(uri"$url")
      .response(asJson[List[NamagomiModResponse]].getRight)
      .send(backend)

    response.body.map(i =>
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
        case _ =>
          Unexpected(
            i.name,
            i.modId,
            i.fileId,
            i.directUrl,
            i.side
          )
      })
  }
}
