package com.github.namagomi.curseforge

case class NamagomiModResponse
(
  side: String,
  fileName: String,
  downloadUrl: Option[String],
  hashes: Option[List[Hash]]
)

case class Hash
(
  value: String,
  algo: Int
)