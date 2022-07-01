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
  downloadCount: Int,
  downloadUrl: Option[String],
  gameVersions: List[String],
  sortableGameVersions: List[SortableGameVersion],
  dependencies: List[String],
  alternateFileId: Int,
  isServerPack: Boolean,
  fileFingerprint: Int,
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

case class Module
(
  name: String,
  fingerprint: Int
)
