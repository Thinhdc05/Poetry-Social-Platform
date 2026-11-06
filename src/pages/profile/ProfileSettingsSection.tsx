import { useState, useEffect, type FormEvent } from 'react'
import type { User } from '@supabase/supabase-js'
import { useAuth, getProfile, updateProfile, updatePassword, type UserProfile } from '../../features/auth'
import { VermilionSeal } from '../../components/common'
import { KeyRound, UserCheck, ShieldCheck } from 'lucide-react'

interface ProfileSettingsSectionProps {
  user?: User
  profile?: UserProfile | null
  onProfileUpdated?: () => void
}

const TRADITIONAL_SEALS = [
  { icon: '📜', name: 'Cuộn Thư' },
  { icon: '✒️', name: 'Bút Lông' },
  { icon: '🪶', name: 'Lông Vũ' },
  { icon: '🍃', name: 'Lá Trúc' },
  { icon: '🌸', name: 'Hoa Đào' },
  { icon: '🍵', name: 'Chén Trà' },
  { icon: '🌙', name: 'Vầng Trăng' },
  { icon: '🏔️', name: 'Núi Biếc' },
  { icon: '🕯️', name: 'Ánh Nến' },
  { icon: '🎋', name: 'Khóm Trúc' },
]

export function ProfileSettingsSection({
  user: propUser,
  profile: propProfile,
  onProfileUpdated,
}: ProfileSettingsSectionProps) {
  const { user: authUser } = useAuth()
  const currentUser = propUser || authUser

  const [fullName, setFullName] = useState(
    propProfile?.fullName || currentUser?.user_metadata?.full_name || ''
  )
  const [bio, setBio] = useState(propProfile?.bio || '')
  const [selectedSeal, setSelectedSeal] = useState(
    propProfile?.avatarUrl || currentUser?.user_metadata?.avatar_url || '📜'
  )
  const [profileLoading, setProfileLoading] = useState(false)
  const [profileMsg, setProfileMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Trạng thái đổi mật khẩu
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [pwdLoading, setPwdLoading] = useState(false)
  const [pwdMsg, setPwdMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    if (!currentUser) return
    let isMounted = true
    getProfile(currentUser.id).then((p) => {
      if (!isMounted || !p) return
      if (p.fullName) setFullName(p.fullName)
      if (p.bio) setBio(p.bio)
      if (p.avatarUrl) setSelectedSeal(p.avatarUrl)
    })
    return () => {
      isMounted = false
    }
  }, [currentUser])

  if (!currentUser) {
    return null
  }

  const handleUpdateProfile = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setProfileMsg(null)

    if (!fullName.trim()) {
      setProfileMsg({ type: 'error', text: 'Bút danh thi nhân không được để trống.' })
      return
    }

    try {
      setProfileLoading(true)
      await updateProfile(currentUser.id, {
        fullName: fullName.trim(),
        bio: bio.trim(),
        avatarUrl: selectedSeal,
      })
      setProfileMsg({ type: 'success', text: '✨ Đã lưu cập nhật thông tin bút danh thành công!' })
      onProfileUpdated?.()
      setTimeout(() => setProfileMsg(null), 4000)
    } catch (err: unknown) {
      setProfileMsg({
        type: 'error',
        text: err instanceof Error ? err.message : 'Không thể cập nhật hồ sơ',
      })
    } finally {
      setProfileLoading(false)
    }
  }

  const handleUpdatePassword = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setPwdMsg(null)

    if (newPassword.length < 6) {
      setPwdMsg({ type: 'error', text: 'Mật khẩu mới phải có ít nhất 6 ký tự.' })
      return
    }

    if (newPassword !== confirmPassword) {
      setPwdMsg({ type: 'error', text: 'Mật khẩu xác nhận không trùng khớp.' })
      return
    }

    try {
      setPwdLoading(true)
      await updatePassword(newPassword)
      setPwdMsg({ type: 'success', text: '🔒 Đổi mật khẩu thành công! Hãy ghi nhớ mật khẩu mới này.' })
      setNewPassword('')
      setConfirmPassword('')
      setTimeout(() => setPwdMsg(null), 4000)
    } catch (err: unknown) {
      setPwdMsg({
        type: 'error',
        text: err instanceof Error ? err.message : 'Không thể đổi mật khẩu',
      })
    } finally {
      setPwdLoading(false)
    }
  }

  return (
    <div className="space-y-8 font-serif">
      {/* 1. Phần Sửa Thông Tin Bút Danh & Triện Mộc */}
      <div className="bg-white/95 dark:bg-[#1c1a18] border border-stone-200/90 dark:border-stone-800 rounded-2xl p-6 sm:p-8 shadow-2xs space-y-6">
        <div className="border-b border-stone-150 dark:border-stone-800 pb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-amber-700 dark:text-amber-400" />
            <h2 className="text-base font-bold text-stone-900 dark:text-stone-100">
              Thông Tin Bút Danh & Con Dấu
            </h2>
          </div>
          <span className="text-[11px] text-stone-400">
            Email: {currentUser.email}
          </span>
        </div>

        {profileMsg && (
          <div
            className={`p-3.5 rounded-xl text-xs ${
              profileMsg.type === 'success'
                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                : 'bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-900'
            }`}
          >
            {profileMsg.text}
          </div>
        )}

        <form onSubmit={handleUpdateProfile} className="space-y-5">
          {/* Xem trước con dấu triện chu sa */}
          <div className="flex items-center gap-4 p-4 rounded-xl bg-stone-50/80 dark:bg-stone-900/60 border border-stone-200/80 dark:border-stone-800">
            <VermilionSeal text={fullName || 'Mộc'} size="lg" shape="square" />
            <div>
              <span className="text-xs font-bold text-stone-800 dark:text-stone-200 block">
                Ấn Triện Chu Sa Tự Động
              </span>
              <p className="text-[11px] text-stone-500 dark:text-stone-400">
                Con dấu triện được khắc tự động từ chữ cái đầu của bút danh thi nhân, đóng dấu trên mỗi bài thơ bạn đăng tải.
              </p>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-stone-700 dark:text-stone-300">
              Bút danh thi nhân (hiển thị trên các bài thơ)
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Ví dụ: Tản Đà, Nguyệt Hạ Khách..."
              className="w-full px-4 py-2.5 text-sm bg-stone-50 dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-xl focus:outline-none focus:border-amber-700 text-stone-900 dark:text-stone-100"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-stone-700 dark:text-stone-300">
              Lời tự sự / Giới thiệu bản thân
            </label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Đôi câu thơ tâm đắc hoặc lời chào gửi đến bạn thơ bốn phương..."
              className="w-full px-4 py-2 text-xs bg-stone-50 dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-xl focus:outline-none focus:border-amber-700 text-stone-900 dark:text-stone-100 resize-none font-sans"
            />
          </div>

          {/* Chọn biểu tượng mộc phụ trợ */}
          <div className="space-y-2">
            <label className="block text-xs font-medium text-stone-700 dark:text-stone-300">
              Biểu tượng tri âm phụ trợ:
            </label>
            <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
              {TRADITIONAL_SEALS.map((seal) => (
                <button
                  key={seal.name}
                  type="button"
                  onClick={() => setSelectedSeal(seal.icon)}
                  title={seal.name}
                  className={`h-11 rounded-xl flex items-center justify-center text-lg border transition-all cursor-pointer ${
                    selectedSeal === seal.icon
                      ? 'border-amber-800 bg-amber-100/80 dark:bg-amber-950/70 shadow-2xs'
                      : 'border-stone-200 dark:border-stone-700 hover:border-amber-600'
                  }`}
                >
                  {seal.icon}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={profileLoading}
              className="px-5 py-2 bg-amber-800 hover:bg-amber-900 disabled:opacity-50 text-stone-50 text-xs font-medium rounded-xl transition-colors cursor-pointer shadow-2xs"
            >
              {profileLoading ? 'Đang lưu...' : 'Lưu thay đổi hồ sơ'}
            </button>
          </div>
        </form>
      </div>

      {/* 2. Phần Đổi Mật Khẩu */}
      <div className="bg-white/95 dark:bg-[#1c1a18] border border-stone-200/90 dark:border-stone-800 rounded-2xl p-6 sm:p-8 shadow-2xs space-y-6">
        <div className="border-b border-stone-150 dark:border-stone-800 pb-3 flex items-center gap-2">
          <KeyRound className="w-4 h-4 text-amber-700 dark:text-amber-400" />
          <h2 className="text-base font-bold text-stone-900 dark:text-stone-100">
            Bảo Mật & Đổi Mật Khẩu
          </h2>
        </div>

        {pwdMsg && (
          <div
            className={`p-3.5 rounded-xl text-xs ${
              pwdMsg.type === 'success'
                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                : 'bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-900'
            }`}
          >
            {pwdMsg.text}
          </div>
        )}

        <form onSubmit={handleUpdatePassword} className="space-y-4 max-w-md font-sans">
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-stone-700 dark:text-stone-300">
              Mật khẩu mới (tối thiểu 6 ký tự)
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-2 text-xs bg-stone-50 dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-xl focus:outline-none focus:border-amber-700 text-stone-900 dark:text-stone-100"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-stone-700 dark:text-stone-300">
              Xác nhận mật khẩu mới
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-2 text-xs bg-stone-50 dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-xl focus:outline-none focus:border-amber-700 text-stone-900 dark:text-stone-100"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={pwdLoading}
              className="px-5 py-2 bg-stone-900 hover:bg-stone-800 dark:bg-stone-800 dark:hover:bg-stone-700 disabled:opacity-50 text-stone-50 text-xs font-serif font-medium rounded-xl transition-colors cursor-pointer shadow-2xs flex items-center gap-1.5"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{pwdLoading ? 'Đang cập nhật...' : 'Cập nhật mật khẩu'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
