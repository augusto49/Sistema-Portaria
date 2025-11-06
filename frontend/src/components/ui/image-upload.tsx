import { useState, useRef } from "react";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import imageCompression from 'browser-image-compression';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

interface ImageUploadProps {
  value?: string | null;
  onChange: (value: string | null) => void;
  disabled?: boolean;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB (arquivo original)
const MAX_COMPRESSED_SIZE = 500 * 1024; // 500KB (após compressão)
const ACCEPTED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

export default function ImageUpload({
  value,
  onChange,
  disabled = false,
}: ImageUploadProps) {
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isBase64 = value?.startsWith("data:image");
  const hasImage = !!value;

  const handleFileSelect = async (file: File) => {
    setError(null);

    // Validar tipo
    if (!ACCEPTED_TYPES.includes(file.type)) {
      setError("Tipo de arquivo não suportado. Use JPG, PNG ou WEBP.");
      return;
    }

    // Validar tamanho original
    if (file.size > MAX_FILE_SIZE) {
      setError("Arquivo muito grande. O tamanho máximo é 5MB.");
      return;
    }

    try {
      // Configurações de compressão
      const options = {
        maxSizeMB: 0.5, // Comprimir para no máximo 500KB
        maxWidthOrHeight: 800, // Redimensionar para máximo 800px
        useWebWorker: true,
        fileType: 'image/jpeg', // Converter para JPEG (melhor compressão)
      };

      // Comprimir imagem
      const compressedFile = await imageCompression(file, options);

      // Converter para base64
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target?.result as string;
        onChange(base64);
      };
      reader.onerror = () => {
        setError("Erro ao ler o arquivo. Tente novamente.");
      };
      reader.readAsDataURL(compressedFile);
    } catch (err) {
      setError("Erro ao processar o arquivo. Tente com uma imagem menor.");
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (disabled) return;

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleRemove = () => {
    onChange(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <Tabs defaultValue="url" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="url">URL</TabsTrigger>
        <TabsTrigger value="upload">Upload</TabsTrigger>
      </TabsList>

      <TabsContent value="url" className="space-y-3">
        <Input
          placeholder="https://exemplo.com/foto.jpg"
          value={!isBase64 ? value || "" : ""}
          onChange={(e) => onChange(e.target.value || null)}
          disabled={disabled}
        />
        {hasImage && !isBase64 && (
          <div className="flex items-center gap-3">
            <Avatar className="h-16 w-16">
              <AvatarImage src={value || ""} alt="Preview" />
              <AvatarFallback>
                <ImageIcon className="h-8 w-8 text-muted-foreground" />
              </AvatarFallback>
            </Avatar>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleRemove}
              disabled={disabled}
            >
              <X className="h-4 w-4 mr-1" />
              Remover
            </Button>
          </div>
        )}
      </TabsContent>

      <TabsContent value="upload" className="space-y-3">
        <div
          className={cn(
            "border-2 border-dashed rounded-lg p-6 transition-colors",
            isDragging && "border-primary bg-primary/5",
            !isDragging && "border-muted-foreground/25",
            disabled && "opacity-50 cursor-not-allowed"
          )}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="flex flex-col items-center justify-center text-center space-y-2">
            <Upload className="h-10 w-10 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">
                Clique para selecionar ou arraste uma imagem
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                JPG, PNG ou WEBP (máximo 5MB, será otimizada automaticamente)
              </p>
            </div>
            <Input
              ref={fileInputRef}
              type="file"
              accept={ACCEPTED_TYPES.join(",")}
              onChange={handleFileInputChange}
              disabled={disabled}
              className="hidden"
              id="file-upload"
            />
            <Label htmlFor="file-upload" className="cursor-pointer">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={disabled}
                asChild
              >
                <span>Selecionar Arquivo</span>
              </Button>
            </Label>
          </div>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {hasImage && isBase64 && (
          <div className="flex items-center gap-3 p-3 border rounded-lg bg-muted/50">
            <Avatar className="h-16 w-16">
              <AvatarImage src={value || ""} alt="Preview" />
              <AvatarFallback>
                <ImageIcon className="h-8 w-8 text-muted-foreground" />
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="text-sm font-medium">Imagem carregada</p>
              <p className="text-xs text-muted-foreground">
                {(value?.length || 0) > 1000
                  ? `${((value?.length || 0) / 1024).toFixed(0)}KB`
                  : "Pequena"}
              </p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={handleRemove}
              disabled={disabled}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
}
