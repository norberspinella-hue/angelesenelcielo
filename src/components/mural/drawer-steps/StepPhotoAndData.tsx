import React, { useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import Cropper from 'react-easy-crop';

interface StepPhotoAndDataProps {
  onNext: () => void;
  onBack: () => void;
  draftData: any;
  setDraftData: (data: any) => void;
  selectedPlan: string;
}

export function StepPhotoAndData({ onNext, onBack, draftData, setDraftData, selectedPlan }: StepPhotoAndDataProps) {
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(draftData.photoUrl || null);
  const [uploading, setUploading] = useState(false);
  const [petDate, setPetDate] = useState<string>(draftData.petDate || '');
  const [species, setSpecies] = useState<string>(draftData.species || 'perro');
  const [breed, setBreed] = useState<string>(draftData.breed || '');
  const [birthDate, setBirthDate] = useState<string>(draftData.birthDate || '');
  const [location, setLocation] = useState<string>(draftData.location || '');

  // Estados nuevos para el recortador
  const [cropModalOpen, setCropModalOpen] = useState(false)
  const [rawImageUrl, setRawImageUrl] = useState<string | null>(null)
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null)

  const inputStyle = {
    width: '100%',
    padding: '10px 14px',
    borderRadius: 12,
    border: '1.5px solid rgba(180,150,220,0.40)',
    fontSize: 14,
    color: '#4A3F6B',
    background: 'rgba(255,255,255,0.80)',
    outline: 'none',
  };

  const isFormValid = draftData.name && petDate;

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 20 * 1024 * 1024) {
      alert('La foto no puede superar 20MB')
      return
    }
    const reader = new FileReader()
    reader.onloadend = () => {
      setRawImageUrl(reader.result as string)
      setCropModalOpen(true) // Abrir modal de recorte
    }
    reader.readAsDataURL(file)
  }

  const onCropComplete = useCallback((_: any, croppedPixels: any) => {
    setCroppedAreaPixels(croppedPixels)
  }, [])

  const getCroppedImage = async (): Promise<Blob | null> => {
    if (!rawImageUrl || !croppedAreaPixels) return null
    
    const image = new Image()
    image.src = rawImageUrl
    await new Promise(resolve => { image.onload = resolve })
    
    const canvas = document.createElement('canvas')
    canvas.width = 400
    canvas.height = 400
    const ctx = canvas.getContext('2d')!
    
    ctx.drawImage(
      image,
      croppedAreaPixels.x,
      croppedAreaPixels.y,
      croppedAreaPixels.width,
      croppedAreaPixels.height,
      0, 0, 400, 400
    )
    
    return new Promise(resolve => {
      canvas.toBlob(resolve, 'image/jpeg', 0.90)
    })
  }

  const handleCropConfirm = async () => {
    const croppedBlob = await getCroppedImage()
    if (!croppedBlob) return
    
    const croppedFile = new File([croppedBlob], 'pet-photo.jpg', { 
      type: 'image/jpeg' 
    })
    
    // Preview local
    setPhotoPreview(URL.createObjectURL(croppedBlob))
    setPhotoFile(croppedFile)
    setCropModalOpen(false)
  }

  const uploadPhoto = async (file: File): Promise<{
    originalUrl: string
    thumbnailUrl: string
  } | null> => {
    const formData = new FormData()
    formData.append('photo', file)

    const res = await fetch('/api/upload-pet-photo', {
      method: 'POST',
      body: formData,
    })

    const data = await res.json()

    if (!res.ok) {
      console.error('Error subiendo foto:', data.error)
      alert('Error al subir la foto: ' + (data.error || 'Error desconocido'))
      return null
    }

    return {
      originalUrl: data.originalUrl,
      thumbnailUrl: data.thumbnailUrl,
    }
  }

  const handleContinue = async () => {
    try {
      setUploading(true);
      let photoUrl = draftData.photoUrl || '';
      let thumbnailUrl = draftData.thumbnailUrl || '';
      if (photoFile) {
        const result = await uploadPhoto(photoFile);
        if (result) {
          photoUrl = result.originalUrl;
          thumbnailUrl = result.thumbnailUrl;
        } else {
          setUploading(false);
          return;
        }
      }
      setDraftData({
        ...draftData,
        photoUrl,
        thumbnailUrl,
        petDate,
        species,
        breed,
        birthDate,
        location
      });
      onNext();
    } catch (error) {
      console.error('Error in handleContinue:', error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col h-full animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-[#1E2A78] font-serif mb-2">Paso 2 — Foto y datos</h2>
        <p className="text-sm text-[#706A95]">Completa los datos de tu angelito para iniciar su recuerdo.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-6 mb-8 flex-1 overflow-y-auto pr-2 custom-scrollbar">
        {/* Columna Izquierda: Formulario */}
        <div className="flex-1 flex flex-col gap-4">
          <div>
            <label className="block text-sm font-bold text-[#1E2A78] mb-1">Foto de tu angelito</label>
            <input
              type="file"
              accept="image/*"
              id="pet-photo"
              style={{ display: 'none' }}
              onChange={handlePhotoChange}
              disabled={uploading}
            />
            <label htmlFor="pet-photo" style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              height: 180,
              border: '2px dashed rgba(180,150,220,0.50)',
              borderRadius: 16,
              cursor: uploading ? 'not-allowed' : 'pointer',
              background: photoPreview 
                ? 'transparent' 
                : 'rgba(245,240,255,0.50)',
              overflow: 'hidden',
              position: 'relative',
            }}>
              {photoPreview ? (
                <img 
                  src={photoPreview} 
                  alt="Preview"
                  style={{ 
                    width: '100%', 
                    height: '100%', 
                    objectFit: 'cover' 
                  }}
                />
              ) : (
                <>
                  <span style={{ fontSize: 32 }}>☁️</span>
                  <p style={{ color: '#9B8FB0', fontSize: 14 }}>
                    Haz clic para subir la foto de tu mascota
                  </p>
                  <p style={{ color: '#B8B0CC', fontSize: 12 }}>
                    JPG, PNG o WebP · Máx 5MB
                  </p>
                </>
              )}
            </label>
          </div>

          <div>
            <label className="block text-sm font-bold text-[#1E2A78] mb-1">Nombre de tu angelito *</label>
            <div className="relative">
              <input 
                type="text" 
                placeholder="Ej. Luna" 
                value={draftData.name || ''}
                onChange={(e) => setDraftData({ ...draftData, name: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm text-[#1E2A78] focus:border-[#C9A961] focus:ring-1 focus:ring-[#C9A961] outline-none"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">🐾</span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ 
              fontSize: 13, 
              color: '#7B6F9A', 
              fontWeight: 600 
            }}>
              Especie *
            </label>
            <select 
              value={species}
              onChange={(e) => setSpecies(e.target.value)}
              style={inputStyle}
            >
              <option value="perro">🐶 Perro</option>
              <option value="gato">🐱 Gato</option>
              <option value="conejo">🐰 Conejo</option>
              <option value="pajaro">🐦 Pájaro</option>
              <option value="caballo">🐴 Caballo</option>
              <option value="otro">🐾 Otro</option>
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ 
              fontSize: 13, 
              color: '#7B6F9A', 
              fontWeight: 600 
            }}>
              Raza (opcional)
            </label>
            <input 
              type="text"
              placeholder="Ej: Golden Retriever (opcional)"
              value={breed}
              onChange={(e) => setBreed(e.target.value)}
              style={inputStyle}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ 
              fontSize: 13, 
              color: '#7B6F9A', 
              fontWeight: 600 
            }}>
              Fecha de nacimiento (opcional)
            </label>
            <input 
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              max={petDate || new Date().toISOString().split('T')[0]}
              style={inputStyle}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ 
              fontSize: 13, 
              color: '#7B6F9A', 
              fontWeight: 600 
            }}>
              Lugar (opcional)
            </label>
            <input 
              type="text"
              placeholder="Ej: Madrid, España (opcional)"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              style={inputStyle}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ 
              fontSize: 13, 
              color: '#7B6F9A', 
              fontWeight: 600 
            }}>
              Fecha de fallecimiento
            </label>
            <input
              type="date"
              value={petDate}
              onChange={(e) => setPetDate(e.target.value)}
              max={new Date().toISOString().split('T')[0]}
              style={{
                padding: '10px 14px',
                borderRadius: 12,
                border: '1.5px solid rgba(180,150,220,0.40)',
                fontSize: 14,
                color: '#4A3F6B',
                background: 'rgba(255,255,255,0.80)',
                outline: 'none',
              }}
            />
          </div>

          <div className="bg-[#FFF8F4] border border-[#F8C7D8] rounded-lg p-3 mt-auto">
            <label className="block text-xs font-bold text-[#1E2A78] mb-1">Plan seleccionado</label>
            <div className="text-sm text-[#1E2A78]">
              {selectedPlan === 'corazon_eterno' ? 'Corazón Eterno (9,99€)' : 
               selectedPlan === 'estrella_brillante' ? 'Estrella Brillante (4,99€/año)' : 
               'Huellita (1,99€)'}
            </div>
          </div>
        </div>

        {/* Columna Derecha: Preview */}
        <div className="flex-1 flex flex-col">
          <label className="block text-sm font-bold text-[#1E2A78] mb-1">Preview de tu recuerdo</label>
          <div 
            className="flex-1 bg-[#F5E6D3] rounded-2xl p-4 flex flex-col items-center justify-center relative overflow-hidden border border-[#E5C88A]"
            style={{ backgroundImage: 'url("/images/mural%20preview/previewrecuerdo.svg")', backgroundSize: 'cover', backgroundPosition: 'center' }}
          >
            {/* Halo y marco simulado */}
            <div className="w-24 h-24 rounded-full bg-white mb-4 border-4 border-[#C9A961] shadow-lg flex items-center justify-center overflow-hidden">
              {photoPreview ? (
                <img 
                  src={photoPreview} 
                  alt="Pet Preview" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-4xl text-gray-300">🐾</span>
              )}
            </div>
            
            <h3 className="font-serif font-bold text-xl text-[#1E2A78] text-center mb-1">
              {draftData.name || 'Nombre'}
            </h3>
            <p className="text-xs text-[#706A95] mb-4 text-center">
              {petDate ? (() => {
                const parts = petDate.split('-');
                return parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : petDate;
              })() : 'DD/MM/AAAA'}
            </p>
          </div>
        </div>
      </div>

      <div className="pt-4 border-t border-gray-100 flex gap-4">
        <button 
          onClick={onBack}
          disabled={uploading}
          className="btn-secondary-heaven btn-drawer-back px-6"
        >
          ← Volver
        </button>
        <button 
          onClick={handleContinue}
          disabled={!isFormValid || uploading}
          className="btn-primary-heaven btn-drawer-cta flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {uploading ? 'Subiendo foto...' : 'Continuar →'}
        </button>
      </div>

      {cropModalOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(40,20,80,0.75)',
          zIndex: 1000,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 20,
        }}>
          <div style={{
            background: 'rgba(255,255,255,0.95)',
            borderRadius: 24,
            padding: 24,
            width: 'min(480px, 95vw)',
            display: 'flex',
            flexDirection: 'column',
            gap: 20,
          }}>
            <h3 style={{ 
              color: '#4A3F6B', 
              textAlign: 'center',
              fontFamily: 'Georgia, serif',
              margin: 0,
            }}>
              Centra la foto de tu mascota 🐾
            </h3>
            
            {/* Área de recorte */}
            <div style={{ 
              position: 'relative', 
              height: 320,
              borderRadius: 16,
              overflow: 'hidden',
              background: '#000',
            }}>
              <Cropper
                image={rawImageUrl!}
                crop={crop}
                zoom={zoom}
                aspect={1}
                cropShape="round"
                showGrid={false}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
              />
            </div>

            {/* Slider zoom */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 13, color: '#9B8FB0', fontFamily: 'sans-serif' }}>
                Zoom
              </span>
              <input
                type="range"
                min={1}
                max={3}
                step={0.1}
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                style={{ flex: 1 }}
              />
            </div>

            <p style={{ 
              fontSize: 13, 
              color: '#9B8FB0', 
              textAlign: 'center',
              fontFamily: 'sans-serif',
              margin: 0,
            }}>
              Arrastra la imagen para centrar a tu mascota
            </p>

            {/* Botones */}
            <div style={{ display: 'flex', gap: 12 }}>
              <button
                onClick={() => setCropModalOpen(false)}
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: 999,
                  border: '1.5px solid rgba(180,150,220,0.40)',
                  background: 'transparent',
                  color: '#9B8FB0',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontFamily: 'sans-serif',
                }}
              >
                Cancelar
              </button>
              <button
                onClick={handleCropConfirm}
                style={{
                  flex: 2,
                  padding: '12px',
                  borderRadius: 999,
                  border: 'none',
                  background: 'linear-gradient(90deg, #ff82ad, #ec5f96)',
                  color: '#fff',
                  fontWeight: 700,
                  cursor: 'pointer',
                  fontFamily: 'sans-serif',
                  boxShadow: '0 4px 12px rgba(236,95,150,0.35)',
                }}
              >
                ✦ Recortar y continuar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
