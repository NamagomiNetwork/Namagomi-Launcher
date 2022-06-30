package com.github.namagomi.main.github

case class NamagomiModResponse
(
  name: Option[String],
  modId: Option[String],
  fileId: Option[String],
  directUrl: Option[String],
  side: String
)
