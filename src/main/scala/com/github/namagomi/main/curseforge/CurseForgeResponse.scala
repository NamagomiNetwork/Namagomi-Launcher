package com.github.namagomi.main.curseforge

case class CurseForgeResponse
(
  data: Data
)

case class Data
(
  id: Int,
  gameId: Int,
  modId: Int,
  isAvailable: Boolean,
  displayName: String,
  fileName: String,
  releaseType: Int,
  fileStatus: Int,
  hashes: List[Hash],
  fileDate: String,
  fileLength: Int,
  downloadCount: Long,
  downloadUrl: Option[String],
  gameVersions: List[String],
  sortableGameVersions: List[SortableGameVersion],
  dependencies: List[String],
  alternateFileId: Int,
  isServerPack: Boolean,
  fileFingerprint: Long,
  modules: List[Module]
)

case class Hash
(
  value: String,
  algo: Int
)

case class SortableGameVersion
(
  gameVersionName: String,
  gameVersionPadded: String,
  gameVersion: String,
  gameVersionReleaseDate: String,
  gameVersionTypeId: Int
)

case class Dependencie
(
  modId: Int,
  relationType: Int
)

case class Module
(
  name: String,
  fingerprint: Long
)
