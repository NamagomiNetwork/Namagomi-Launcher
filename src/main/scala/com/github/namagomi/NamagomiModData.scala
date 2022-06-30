package com.github.namagomi

sealed trait NamagomiModData

case class HasDownloadUrl
(
  name: Option[String],
  directUrl: String,
  side: String
) extends NamagomiModData
case class HasNotDownloadUrl
(
  name: Option[String],
  modId: String,
  fileId: String,
  side: String
) extends NamagomiModData
case class Unexpected
(
  name: Option[String],
  modId: Option[String],
  fileId: Option[String],
  directUrl: Option[String],
  side: String
) extends NamagomiModData