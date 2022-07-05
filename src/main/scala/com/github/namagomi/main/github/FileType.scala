package com.github.namagomi.main.github

sealed trait FileType

case class Blob() extends FileType
case class Tree() extends FileType