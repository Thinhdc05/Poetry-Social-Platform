export interface OnlinePoet {
  id: string
  penName: string
  seal: string
  status: string
  joinedAt: string
}

export interface LoungeMessage {
  id: string
  senderId: string
  senderName: string
  senderSeal: string
  content: string
  createdAt: string
  type: 'chat' | 'verse'
}

