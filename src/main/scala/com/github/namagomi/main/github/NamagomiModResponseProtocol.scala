package com.github.namagomi.main.github

import spray.json.{DefaultJsonProtocol, RootJsonFormat}

object NamagomiModResponseProtocol extends DefaultJsonProtocol {
  implicit val namagomiModResponseProtocol: RootJsonFormat[NamagomiModResponse] = jsonFormat(NamagomiModResponse, "name", "modId", "fileId", "directUrl", "mcVersion", "side")
}
