package com.github.namagomi.curseforge

import com.github.namagomi.Config.{curseForgeApiKey, curseForgeUrl}
import com.github.namagomi.{NamagomiMod, NamagomiModA, NamagomiModB}
import com.github.namagomi.curseforge.NamagomiModResponse
import cats.effect.IO
import org.http4s.ember.client.*
import cats.effect.IO
import cats.effect.unsafe.implicits.global
import io.circe.Decoder

object CurseForgeWrapper {
  private val curseForgeHeaders = Map(
    "Accept" -> "application/json",
    "x-api-key" -> curseForgeApiKey
  )

  import io.circe.generic.semiauto._
  implicit def namagomiModResponseDecoder: Decoder[NamagomiModResponse] = deriveDecoder[NamagomiModResponse]

  import org.http4s.circe.CirceEntityDecoder._
  implicit def responseDecoder: Any = circeEntityDecoder[IO,NamagomiModResponse]

  def getModFileUrl(namagomiMod: NamagomiMod): Unit =
    namagomiMod match {
      case NamagomiModA(_, directUrl, side) =>
        NamagomiModResponse(
          side,
          getFileName(directUrl),
          directUrl,
          None,
        )
      case NamagomiModB(_, modId, mcVersion, fileId, side) =>
        val getFileUrl = Uri(curseForgeUrl, Seq("v1/mods", modId, "files", fileId))
        val request = Request.apply[IO](Method.POST)

        NamagomiModResponse(
          side,
          "",
          "directUrl",
          None,
        )
    }

    def getFileName(url: String): String =
      "TODO: urlからファイル名を取得" //TODO: urlからファイル名を取得
}
