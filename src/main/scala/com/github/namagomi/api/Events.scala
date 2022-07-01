package com.github.namagomi.api

import com.github.namagomi.main.curseforge.CurseForgeWrapper.downloadModFiles
import javafx.event.{ActionEvent, EventHandler}

object Events {
  val sampleButtonOnClick: EventHandler[ActionEvent] = (e: ActionEvent) => {
    downloadModFiles("CLIENT")
  }
}
