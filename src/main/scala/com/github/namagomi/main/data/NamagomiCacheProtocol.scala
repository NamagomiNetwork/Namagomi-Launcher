package com.github.namagomi.main.data

import spray.json.{DefaultJsonProtocol, RootJsonFormat}

object NamagomiCacheProtocol extends DefaultJsonProtocol {
  implicit val dataProtocol: RootJsonFormat[Data] = jsonFormat(Data.apply, "name", "sha")
  implicit val namagomiCacheProtocol: RootJsonFormat[NamagomiCache] = jsonFormat(NamagomiCache.apply, "data", "mods")
}
