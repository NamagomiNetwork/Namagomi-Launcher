package com.github.namagomi.main.data

import com.github.namagomi.main.data.NamagomiCacheProtocol._
import spray.json._

case class NamagomiCache
(
  data: Seq[Data],
  mods: String
)

case class Data
(
  name: String,
  sha: String
)

object NamagomiCache {
  def getEmpty: String = {
    NamagomiCache(Seq.empty, "").toJson.compactPrint
  }
}