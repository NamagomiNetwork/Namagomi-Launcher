package com.github.namagomi.main.curseforge

import spray.json.{DefaultJsonProtocol, RootJsonFormat}

object Protocol extends DefaultJsonProtocol{
  implicit val moduleProtocol: RootJsonFormat[Module] = jsonFormat(Module.apply, "name", "fingerprint")
  implicit val dependencyProtocol: RootJsonFormat[Dependency] = jsonFormat(Dependency, "modId", "relationType")
  implicit val sortableGameVersionProtocol: RootJsonFormat[SortableGameVersion] = jsonFormat(SortableGameVersion, "gameVersionName", "gameVersionPadded", "gameVersion", "gameVersionReleaseDate", "gameVersionTypeId")
  implicit val hashProtocol: RootJsonFormat[Hash] = jsonFormat(Hash, "value", "algo")
  implicit val dataProtocol: RootJsonFormat[Data] = jsonFormat(Data, "id", "gameId", "modId", "isAvailable", "displayName", "fileName", "releaseType", "fileStatus", "hashes", "fileDate", "fileLength", "downloadCount", "downloadUrl", "gameVersions", "sortableGameVersions", "dependencies", "alternateFileId", "isServerPack", "fileFingerprint", "modules")
  implicit val curseForgeResponseProtocol: RootJsonFormat[FileResponse] = jsonFormat(FileResponse.apply, "data")
}
