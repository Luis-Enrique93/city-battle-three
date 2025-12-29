import { Component, type JSX } from 'preact'
import { Game } from './game'

export class App extends Component {
  private gameContainerRef: HTMLDivElement | null = null

  public componentDidMount(): void {
    if (this.gameContainerRef) {
      const game = Game.getInstance()
      game.initialize(this.gameContainerRef)
    }
  }

  public componentWillUnmount(): void {
    const game = Game.getInstance()
    game.stop()
  }

  private setGameContainerRef = (ref: HTMLDivElement | null): void => {
    this.gameContainerRef = ref
  }

  public render(): JSX.Element {
    return (
      <>
        <div
          ref={this.setGameContainerRef}
          id="game-container"
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            width: '100vw',
            height: '100vh',
            backgroundColor: '#000',
          }}
        />
      </>
    )
  }
}
