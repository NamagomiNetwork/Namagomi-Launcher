package com.github.namagomi

import java.nio.file.Paths

object LocalPaths {

  import net.harawata.appdirs.{AppDirs, AppDirsFactory}

  private val appDirs: AppDirs = AppDirsFactory.getInstance
  val userDir: String = appDirs.getUserDataDir("Namagomi Launcher", null, "Namagomi Network")
  val minecraftDir: String = Paths.get(userDir, "minecraft").toString
  val mainDir: String => String = (side: String) => Paths.get(minecraftDir, s"main-$side").toString
  val modsDir: String => String = (side: String) => Paths.get(mainDir(side), "mods").toString
  val namagomiCache: String => String = (side: String) => Paths.get(mainDir(side), ".namagomi-cache").toString
  val namagomiIgnore: String => String = (side: String) => Paths.get(mainDir(side), ".namagomi-cache").toString
  val logsDir: String = Paths.get(userDir, "logs").toString
}
