package com.github.namagomi.github

case class NamagomiModResponse
(
  name: Option[String],
  modId: Option[String],
  fileId: Option[String],
  directUrl: Option[String],
  side: String
)
