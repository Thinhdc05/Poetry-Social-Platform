export type AmbientSoundType = 'none' | 'rain' | 'fireplace' | 'wind'

class AmbientAudioEngine {
  private ctx: AudioContext | null = null
  private gainNode: GainNode | null = null
  private activeNodes: AudioNode[] = []
  private currentType: AmbientSoundType = 'none'
  private volume = 0.35

  private initContext() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      this.ctx = new AudioCtx()
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume()
    }
  }

  public stop() {
    this.activeNodes.forEach((node) => {
      try {
        if ('stop' in node && typeof (node as AudioScheduledSourceNode).stop === 'function') {
          ;(node as AudioScheduledSourceNode).stop()
        }
        node.disconnect()
      } catch {
        // Bỏ qua nếu node đã dừng
      }
    })
    this.activeNodes = []
    this.currentType = 'none'
  }

  public setVolume(val: number) {
    this.volume = Math.max(0, Math.min(1, val))
    if (this.gainNode && this.ctx) {
      this.gainNode.gain.setTargetAtTime(this.volume, this.ctx.currentTime, 0.1)
    }
  }

  public play(type: AmbientSoundType) {
    if (type === 'none') {
      this.stop()
      return
    }

    this.stop()
    this.initContext()
    if (!this.ctx) return

    this.currentType = type
    const ctx = this.ctx

    // Master gain
    const masterGain = ctx.createGain()
    masterGain.gain.setValueAtTime(0.01, ctx.currentTime)
    masterGain.gain.exponentialRampToValueAtTime(this.volume, ctx.currentTime + 0.8)
    masterGain.connect(ctx.destination)
    this.gainNode = masterGain
    this.activeNodes.push(masterGain)

    // Tạo buffer tiếng ồn nền 4 giây
    const bufferSize = ctx.sampleRate * 4
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
    const data = buffer.getChannelData(0)

    if (type === 'rain') {
      // Pink/Brown noise tạo tiếng mưa đêm rả rích
      let lastOut = 0.0
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1
        data[i] = (lastOut + 0.04 * white) / 1.04
        lastOut = data[i]
        data[i] *= 1.8
      }

      const source = ctx.createBufferSource()
      source.buffer = buffer
      source.loop = true

      const filter = ctx.createBiquadFilter()
      filter.type = 'lowpass'
      filter.frequency.value = 850

      source.connect(filter)
      filter.connect(masterGain)
      source.start()
      this.activeNodes.push(source, filter)
    } else if (type === 'fireplace') {
      // Tiếng lửa ấm kèm tiếng củi nổ lách tách nhẹ
      let lastOut = 0.0
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1
        lastOut = (lastOut + 0.02 * white) / 1.02
        // Thêm gai lách tách ngẫu nhiên
        const crackle = Math.random() > 0.9985 ? (Math.random() * 2 - 1) * 1.6 : 0
        data[i] = lastOut * 2.2 + crackle * 0.35
      }

      const source = ctx.createBufferSource()
      source.buffer = buffer
      source.loop = true

      const filter = ctx.createBiquadFilter()
      filter.type = 'lowpass'
      filter.frequency.value = 1200

      source.connect(filter)
      filter.connect(masterGain)
      source.start()
      this.activeNodes.push(source, filter)
    } else if (type === 'wind') {
      // Tiếng gió chiều thổi qua rặng trúc với LFO điều biến tần số
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * 0.5
      }

      const source = ctx.createBufferSource()
      source.buffer = buffer
      source.loop = true

      const bandpass = ctx.createBiquadFilter()
      bandpass.type = 'bandpass'
      bandpass.frequency.value = 380
      bandpass.Q.value = 3.5

      const lfo = ctx.createOscillator()
      lfo.type = 'sine'
      lfo.frequency.value = 0.14 // Chu kỳ gió 7 giây

      const lfoGain = ctx.createGain()
      lfoGain.gain.value = 160

      lfo.connect(lfoGain)
      lfoGain.connect(bandpass.frequency)

      source.connect(bandpass)
      bandpass.connect(masterGain)

      source.start()
      lfo.start()
      this.activeNodes.push(source, bandpass, lfo, lfoGain)
    }
  }

  public getCurrentType(): AmbientSoundType {
    return this.currentType
  }
}

export const ambientEngine = new AmbientAudioEngine()

