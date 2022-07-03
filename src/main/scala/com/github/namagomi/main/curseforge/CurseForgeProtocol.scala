package com.github.namagomi.main.curseforge

import spray.json.{DefaultJsonProtocol, RootJsonFormat}

class CurseForgeProtocol extends DefaultJsonProtocol{
  implicit val moduleProtocol: RootJsonFormat[Module] = jsonFormat2(Module)
  implicit val dependencyProtocol: RootJsonFormat[Dependency] = jsonFormat2(Dependency)
  implicit val sortableGameVersionProtocol: RootJsonFormat[SortableGameVersion] = jsonFormat5(SortableGameVersion)
  implicit val hashProtocol: RootJsonFormat[Hash] = jsonFormat2(Hash)
  implicit val dataProtocol: RootJsonFormat[Data] = jsonFormat20(Data)
  implicit val curseForgeResponseProtocol: RootJsonFormat[CurseForgeResponse] = jsonFormat1(CurseForgeResponse)
}
