package com.github.namagomi.main.curseforge

import com.github.namagomi.main.curseforge.Common._
import pl.iterators.kebs.json.KebsSpray
import spray.json._
import KebsProtocol._

object KebsProtocol extends DefaultJsonProtocol with KebsSpray

object Protocol extends DefaultJsonProtocol{
  implicit val moduleProtocol: RootJsonFormat[Module] = jsonFormat(Module, "name", "fingerprint")
  implicit val dependencyProtocol: RootJsonFormat[Dependency] = jsonFormat(Dependency, "modId", "relationType")
  implicit val sortableGameVersionProtocol: RootJsonFormat[SortableGameVersion] = jsonFormat(SortableGameVersion, "gameVersionName", "gameVersionPadded", "gameVersion", "gameVersionReleaseDate", "gameVersionTypeId")
  implicit val hashProtocol: RootJsonFormat[Hash] = jsonFormat(Hash, "value", "algo")

  implicit val fileResponseDataProtocol: RootJsonFormat[FileResponse.Data] = jsonFormat(FileResponse.Data, "id", "gameId", "modId", "isAvailable", "displayName", "fileName", "releaseType", "fileStatus", "hashes", "fileDate", "fileLength", "downloadCount", "downloadUrl", "gameVersions", "sortableGameVersions", "dependencies", "alternateFileId", "isServerPack", "fileFingerprint", "modules")
  implicit val fileResponseProtocol: RootJsonFormat[FileResponse.FileResponse] = jsonFormat(FileResponse.FileResponse, "data")

  implicit val modResponseLatestFilesIndexProtocol = implicitly[JsonFormat[ModResponse.LatestFile]]
  implicit val modResponseLatestFileProtocol = implicitly[JsonFormat[ModResponse.LatestFile]]
  implicit val modResponseScreenshotProtocol = implicitly[JsonFormat[ModResponse.Screenshot]]
  implicit val modResponseLogoProtocol = implicitly[JsonFormat[ModResponse.Logo]]
  implicit val modResponseAuthorProtocol = implicitly[JsonFormat[ModResponse.Author]]
  implicit val modResponseCategoryProtocol = implicitly[JsonFormat[ModResponse.Category]]
  implicit val modResponseLinksProtocol = implicitly[JsonFormat[ModResponse.Links]]
  implicit val modResponseDataProtocol = implicitly[JsonFormat[ModResponse.Data]]
  implicit val modResponseProtocol = implicitly[JsonFormat[ModResponse.ModResponse]]
}
