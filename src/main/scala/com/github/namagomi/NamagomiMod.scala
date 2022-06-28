package com.github.namagomi

type Side = "SERVER" | "CLIENT" | ""

sealed trait NamagomiMod

case class NamagomiModA
(
  name: Option[String],
  directUrl: String,
  side: Side
) extends NamagomiMod
case class NamagomiModB
(
  name: Option[String],
  modId: String,
  mcVersion: String,
  fileId: String,
  side: Side
) extends NamagomiMod