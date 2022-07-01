package com.github.namagomi.renderer

import scalafx.application.JFXApp3
import scalafx.geometry.Insets
import scalafx.scene.Scene
import scalafx.scene.control.Button
import scalafx.scene.layout.HBox
import scalafx.scene.paint.Color
import com.github.namagomi.api.Events

object Main extends JFXApp3 {
  override def start(): Unit = {
    stage = new JFXApp3.PrimaryStage {
      //    initStyle(StageStyle.Unified)
      title = "ScalaFX Hello World"
      scene = new Scene {
        fill = Color.rgb(38, 38, 38)
        content = new HBox {
          padding = Insets(50, 80, 50, 80)
          children = Seq(
            new Button {
              text = "sample"
              onAction = Events.sampleButtonOnClick
            }
          )
        }
      }
    }
  }
}
