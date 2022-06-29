package com.github.namagomi

import java.nio.file.Paths

object Config {
  val curseForgeApiKey = "$2a$10$yZxE0Hr8YIFv3ZA2Z9T/julePcDjXYNHEzAT1VuCykgKlUJI1HIby"
  val curseForgeUrl = "https://api.curseforge.com"
  val namagomiFileUrlBase: (String, String) => String = (branch: String, path: String) => s"https://raw.githubusercontent.com/NamagomiNetwork/Namagomi-mod/$branch/$path"
  val namagomiModListUrl: String => String = (branch: String) => namagomiFileUrlBase(s"$branch", "mod/mod_list.json")
  val namagomiDataFileUrlBase: (String, String) => String = (branch: String, file: String) => namagomiFileUrlBase(branch, Paths.get("data", file).toString)
}
