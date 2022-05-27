import {LauncherProfileBuilder} from "./LauncherProfileBuilder";
import app = Electron.app;
import path from "path";

const namagomiBase64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIAAAACACAYAAADDPmHLAAAABGdBTUEAALGeYUxB9wAAACBjSFJNAACHEAAAjBIAAP1NAACBPgAAWesAARIPAAA85gAAGc66ySIyAAABJmlDQ1BBZG9iZSBSR0IgKDE5OTgpAAAoz2NgYDJwdHFyZRJgYMjNKykKcndSiIiMUmA/z8DGwMwABonJxQWOAQE+IHZefl4qAwb4do2BEURf1gWZxUAa4EouKCoB0n+A2CgltTiZgYHRAMjOLi8pAIozzgGyRZKywewNIHZRSJAzkH0EyOZLh7CvgNhJEPYTELsI6Akg+wtIfTqYzcQBNgfClgGxS1IrQPYyOOcXVBZlpmeUKBhaWloqOKbkJ6UqBFcWl6TmFit45iXnFxXkFyWWpKYA1ULcBwaCEIWgENMAarTQZKAyAMUDhPU5EBy+jGJnEGIIkFxaVAZlMjIZE+YjzJgjwcDgv5SBgeUPQsykl4FhgQ4DA/9UhJiaIQODgD4Dw745AMDGT/0ZOjZcAAAACXBIWXMAABJ0AAASdAHeZh94AAAGxmlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNS42LWMxNDggNzkuMTY0MDM2LCAyMDE5LzA4LzEzLTAxOjA2OjU3ICAgICAgICAiPiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtbG5zOmRjPSJodHRwOi8vcHVybC5vcmcvZGMvZWxlbWVudHMvMS4xLyIgeG1sbnM6cGhvdG9zaG9wPSJodHRwOi8vbnMuYWRvYmUuY29tL3Bob3Rvc2hvcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RFdnQ9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZUV2ZW50IyIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ0MgMjAxOSAoV2luZG93cykiIHhtcDpDcmVhdGVEYXRlPSIyMDE5LTEwLTA2VDE5OjEyOjU1KzAyOjAwIiB4bXA6TW9kaWZ5RGF0ZT0iMjAyMC0wMy0wOVQyMDo1NTozMCswMTowMCIgeG1wOk1ldGFkYXRhRGF0ZT0iMjAyMC0wMy0wOVQyMDo1NTozMCswMTowMCIgZGM6Zm9ybWF0PSJpbWFnZS9wbmciIHBob3Rvc2hvcDpDb2xvck1vZGU9IjMiIHBob3Rvc2hvcDpJQ0NQcm9maWxlPSJBZG9iZSBSR0IgKDE5OTgpIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOjA4ZGVmYTk4LTgxMTAtMjQ0Yy1hMTU5LTdjOTJmYzA2NmVjYiIgeG1wTU06RG9jdW1lbnRJRD0iYWRvYmU6ZG9jaWQ6cGhvdG9zaG9wOmRiMDYwNmNlLWY5MWQtM2Y0OS1hYmJiLTE3NDE3YWFjNDQzNSIgeG1wTU06T3JpZ2luYWxEb2N1bWVudElEPSJ4bXAuZGlkOmYxNjMyYmEwLTgwZDYtZTk0Ni1hMDlhLTY2ODNiZjU5NGQ0MyI+IDx4bXBNTTpIaXN0b3J5PiA8cmRmOlNlcT4gPHJkZjpsaSBzdEV2dDphY3Rpb249ImNyZWF0ZWQiIHN0RXZ0Omluc3RhbmNlSUQ9InhtcC5paWQ6ZjE2MzJiYTAtODBkNi1lOTQ2LWEwOWEtNjY4M2JmNTk0ZDQzIiBzdEV2dDp3aGVuPSIyMDE5LTEwLTA2VDE5OjEyOjU1KzAyOjAwIiBzdEV2dDpzb2Z0d2FyZUFnZW50PSJBZG9iZSBQaG90b3Nob3AgQ0MgMjAxOSAoV2luZG93cykiLz4gPHJkZjpsaSBzdEV2dDphY3Rpb249InNhdmVkIiBzdEV2dDppbnN0YW5jZUlEPSJ4bXAuaWlkOmZmZTAxOGRhLWNiNDEtN2Q0Yi1hNjU0LTkyMzE1ZjQxZDAzYiIgc3RFdnQ6d2hlbj0iMjAxOS0xMC0wNlQxOTo1Nzo0MiswMjowMCIgc3RFdnQ6c29m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"

export function setup() {
    const launcher = new LauncherProfileBuilder()
    launcher
        .set('uniqueId', 'namagomi')
        .set('gameDir', path.join(app.getPath('userData'),'minecraft'))
        .set('icon', namagomiBase64)
        .set('name', '生ごみ鯖')
        .set('lastVersionId', '1.12.2-forge-14.23.5.2860')
        .set('type', 'custom')
        .build()
}