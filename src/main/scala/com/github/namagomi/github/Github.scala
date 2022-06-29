package com.github.namagomi.github

import io.circe.Decoder
import io.circe.generic.semiauto.deriveDecoder
import sttp.client3.{HttpClientSyncBackend, Identity, SttpBackend}

object Github {
  private val backend: SttpBackend[Identity, Any] = HttpClientSyncBackend()

  private implicit val decoder: Decoder[] = deriveDecoder

  def getModList(url: String) = {

  }
}
