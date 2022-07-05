package com.github.namagomi.main.github

sealed trait FileType

object FileType {
  case object Blob extends FileType
  case object Tree extends FileType
}