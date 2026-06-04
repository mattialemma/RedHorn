import { useId, useMemo, useState } from "react";
import { FiArrowLeft, FiPlus, FiX } from "react-icons/fi";
import { Button } from "@/components/ui/button";
import { ColorPickerField } from "@/components/ui/color-picker-field";
import { DropdownField } from "@/components/ui/dropdown-field";
import { ImageCropModal } from "@/components/ui/image-crop-modal";
import { Modal } from "@/components/ui/modal";
import { SearchableDropdownField } from "@/components/ui/searchable-dropdown-field";
import { TextAreaField, TextField } from "@/components/ui/form-field";
import { StepIndicator } from "@/components/ui/step-indicator";
import type { Client } from "@/app/page";
import { apiUrl } from "@/lib/api";
import { getCountryOptions } from "@/lib/countries";
import { compressImageForClient } from "@/lib/image-crop";
import {
  sanitizeDigits,
  validateOptionalAlphanumeric,
  validateOptionalDigits,
  validateOptionalEmail,
  validateOptionalText,
  validateRequiredText,
} from "@/lib/client-form-validation";
import { useImageCropFlow } from "./use-image-crop-flow";

type CreateClientModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (client: Client) => void;
};

type ClientFormStep = 1 | 2 | 3;
type FormErrors = Record<string, string>;

const themeColors = ["#3b82f6", "#f7b833", "#ff3d57", "#16bf91", "#d80d0d", "#17b9a7", "#f69b9e"];
const categoryOptions = [
  { label: "Personalizzata", value: "__custom__" },
  { label: "Moda", value: "Moda" },
  { label: "Alimenti", value: "Alimenti" },
  { label: "Musica", value: "Musica" },
  { label: "Arte", value: "Arte" },
];
const clientTypeOptions = [
  { label: "Privato", value: "private" },
  { label: "Libero professionista", value: "freelancer" },
  { label: "Associazione", value: "association" },
  { label: "SRL / Azienda", value: "company" },
  { label: "Ente pubblico", value: "public_entity" },
  { label: "Altro", value: "other" },
];

const stepCopy: Record<ClientFormStep, { title: string; subtitle: string }> = {
  1: {
    title: "Dettagli cliente",
    subtitle: "Inizia definendo le basi del tuo nuovo cliente.",
  },
  2: {
    title: "Anagrafica cliente",
    subtitle: "Aggiungi solo i dati utili per fatture, contratti e gestione.",
  },
  3: {
    title: "Contatti e fatturazione",
    subtitle: "Completa i riferimenti operativi e amministrativi opzionali.",
  },
};

export function CreateClientModal({ isOpen, onClose, onCreated }: CreateClientModalProps) {
  const titleId = useId();
  const fileInputId = useId();
  const [currentStep, setCurrentStep] = useState<ClientFormStep>(1);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [customCategory, setCustomCategory] = useState("");
  const [description, setDescription] = useState("");
  const [photoError, setPhotoError] = useState("");
  const [selectedColor, setSelectedColor] = useState(themeColors[0]);
  const [clientType, setClientType] = useState("");
  const [legalName, setLegalName] = useState("");
  const [vatNumber, setVatNumber] = useState("");
  const [taxCode, setTaxCode] = useState("");
  const [mainContactName, setMainContactName] = useState("");
  const [mainContactRole, setMainContactRole] = useState("");
  const [email, setEmail] = useState("");
  const [phonePrefix, setPhonePrefix] = useState("39");
  const [phone, setPhone] = useState("");
  const [billingEmail, setBillingEmail] = useState("");
  const [pec, setPec] = useState("");
  const [sdiCode, setSdiCode] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [country, setCountry] = useState("");
  const [administrativeNotes, setAdministrativeNotes] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const imageCrop = useImageCropFlow();
  const copy = stepCopy[currentStep];
  const countryOptions = useMemo(() => getCountryOptions(), []);

  const setFieldErrorCleared = (field: string) => {
    setErrors((current) => {
      if (!current[field]) return current;
      const next = { ...current };
      delete next[field];
      return next;
    });
  };

  const handlePhotoChange = async (file: File | undefined) => {
    if (!file) return;

    if (!["image/png", "image/jpeg"].includes(file.type)) {
      setPhotoError("Carica un file PNG o JPG.");
      return;
    }

    try {
      const compressedFile = await compressImageForClient(file);
      if (compressedFile.size > 2 * 1024 * 1024) {
        setPhotoError("Il file deve essere massimo 2MB.");
        return;
      }

      setPhotoError("");
      imageCrop.handleImageSelect(compressedFile);
    } catch {
      setPhotoError("Non sono riuscito a comprimere questa immagine.");
    }
  };

  const validateStep = (step: ClientFormStep) => {
    const nextErrors: FormErrors = {};

    if (step === 1) {
      nextErrors.name = validateRequiredText(name, "Nome cliente", 3, 30);
      if (!category) {
        nextErrors.category = "Categoria e obbligatoria.";
      }
      if (category === "__custom__") {
        nextErrors.customCategory = validateRequiredText(customCategory, "Categoria", 3, 10);
      }
      nextErrors.description = validateOptionalText(description, "Descrizione", 3, 256);
    }

    if (step === 2) {
      if (!clientType) nextErrors.clientType = "Tipo cliente e obbligatorio.";
      nextErrors.legalName = validateOptionalText(legalName, "Ragione sociale / Nome legale", 3, 80);
      nextErrors.vatNumber = validateOptionalAlphanumeric(vatNumber, "Partita IVA", 3, 20);
      nextErrors.taxCode = validateOptionalAlphanumeric(taxCode, "Codice fiscale", 3, 20);
      nextErrors.pec = validateOptionalEmail(pec, "PEC");
      nextErrors.sdiCode = validateOptionalAlphanumeric(sdiCode, "Codice SDI", 3, 10);
    }

    if (step === 3) {
      nextErrors.mainContactName = validateOptionalText(mainContactName, "Referente principale", 3, 80);
      nextErrors.mainContactRole = validateOptionalText(mainContactRole, "Ruolo referente", 3, 60);
      nextErrors.email = validateOptionalEmail(email, "Email");
      nextErrors.phonePrefix = phone ? validateOptionalDigits(phonePrefix, "Prefisso", 1, 4) : "";
      nextErrors.phone = validateOptionalDigits(phone, "Telefono", 5, 15);
      nextErrors.billingEmail = validateOptionalEmail(billingEmail, "Email amministrativa");
      nextErrors.address = validateOptionalText(address, "Indirizzo fatturazione", 3, 120);
      nextErrors.city = validateOptionalText(city, "Citta", 3, 80);
      nextErrors.postalCode = validateOptionalDigits(postalCode, "CAP", 3, 10);
      nextErrors.administrativeNotes = validateOptionalText(administrativeNotes, "Note amministrative", 3, 256);
    }

    Object.keys(nextErrors).forEach((key) => {
      if (!nextErrors[key]) delete nextErrors[key];
    });

    return nextErrors;
  };

  const resetForm = () => {
    setCurrentStep(1);
    setName("");
    setCategory("");
    setCustomCategory("");
    setDescription("");
    setPhotoError("");
    setSelectedColor(themeColors[0]);
    setClientType("");
    setLegalName("");
    setVatNumber("");
    setTaxCode("");
    setMainContactName("");
    setMainContactRole("");
    setEmail("");
    setPhonePrefix("39");
    setPhone("");
    setBillingEmail("");
    setPec("");
    setSdiCode("");
    setAddress("");
    setCity("");
    setPostalCode("");
    setCountry("");
    setAdministrativeNotes("");
    setErrors({});
    setSubmitError("");
    imageCrop.clearSelectedImage();
  };

  const submitClient = async () => {
    const allErrors = {
      ...validateStep(1),
      ...validateStep(2),
      ...validateStep(3),
    };
    setErrors(allErrors);
    if (Object.keys(allErrors).length > 0) {
      if (validateStep(1).name || validateStep(1).category || validateStep(1).customCategory || validateStep(1).description) {
        setCurrentStep(1);
      } else if (Object.keys(validateStep(2)).length > 0) {
        setCurrentStep(2);
      }
      return;
    }

    setIsSubmitting(true);
    setSubmitError("");
    try {
      const formData = new FormData();
      formData.append("name", name.trim());
      formData.append("category", category === "__custom__" ? customCategory.trim() : category);
      formData.append("notes", description.trim());
      formData.append("theme_color", selectedColor);
      formData.append("client_type", clientType);
      formData.append("legal_name", legalName.trim());
      formData.append("vat_number", vatNumber.trim());
      formData.append("tax_code", taxCode.trim());
      formData.append("contact_name", mainContactName.trim());
      formData.append("contact_role", mainContactRole.trim());
      formData.append("email", email.trim());
      formData.append("billing_email", billingEmail.trim());
      formData.append("phone_prefix", phonePrefix.trim());
      formData.append("phone", phone.trim());
      formData.append("pec", pec.trim());
      formData.append("sdi_code", sdiCode.trim());
      formData.append("address", address.trim());
      formData.append("city", city.trim());
      formData.append("postal_code", postalCode.trim());
      formData.append("country", country);
      formData.append("administrative_notes", administrativeNotes.trim());
      if (imageCrop.selectedImageFile) {
        formData.append("photo", imageCrop.selectedImageFile);
      }

      const csrfToken = await ensureCsrfToken();
      const response = await fetch(apiUrl("/clients/"), {
        method: "POST",
        credentials: "include",
        headers: csrfToken ? { "X-CSRFToken": csrfToken } : undefined,
        body: formData,
      });
      const payload = await response.json();

      if (!response.ok) {
        if (payload && typeof payload === "object") {
          const apiErrors: FormErrors = {};
          Object.entries(payload).forEach(([key, value]) => {
            apiErrors[key] = Array.isArray(value) ? String(value[0]) : String(value);
          });
          setErrors(apiErrors);
        }
        setSubmitError("Controlla i dati inseriti e riprova.");
        return;
      }

      resetForm();
      onCreated(payload as Client);
    } catch {
      setSubmitError("Errore durante la creazione del cliente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const goNext = () => {
    const stepErrors = validateStep(currentStep);
    setErrors(stepErrors);
    if (Object.keys(stepErrors).length > 0) return;
    if (currentStep === 3) {
      void submitClient();
      return;
    }
    setCurrentStep((step) => (step < 3 ? ((step + 1) as ClientFormStep) : step));
  };

  const goBack = () => {
    setCurrentStep((step) => (step > 1 ? ((step - 1) as ClientFormStep) : step));
  };

  const getCookie = (name: string) => {
    return document.cookie
      .split("; ")
      .find((row) => row.startsWith(`${name}=`))
      ?.split("=")[1];
  };

  const ensureCsrfToken = async () => {
    await fetch(apiUrl("/csrf/"), {
      credentials: "include",
    });
    return getCookie("csrftoken") ?? "";
  };

  return (
    <>
      <Modal isOpen={isOpen} labelledBy={titleId}>
        <div className="flex h-[min(792px,calc(100vh-32px))] flex-col">
          <div className="flex items-start justify-between gap-8 px-9 pt-11">
          <div>
            <h2 id={titleId} className="text-3xl font-bold tracking-tight text-white">
              {copy.title}
            </h2>
            <p className="mt-3 text-xl text-slate-400">{copy.subtitle}</p>
          </div>
          <StepIndicator currentStep={currentStep} totalSteps={3} />
        </div>

          <div className="flex-1 overflow-y-auto px-9 pb-8 pt-8">
            {currentStep === 1 ? (
              <>
                <div className="grid gap-5 md:grid-cols-[minmax(0,1fr)_210px]">
            <TextField
              label="Nome cliente"
              count={`${name.length} / 30`}
              maxLength={30}
              value={name}
              error={errors.name}
              onChange={(event) => {
                setName(event.target.value);
                setFieldErrorCleared("name");
              }}
              placeholder="es. Campagna Marketing Q4"
            />
            {category === "__custom__" ? (
              <div>
                <div className="mb-2 flex items-center justify-between gap-4">
                  <p className="text-sm font-bold text-slate-100">Categoria</p>
                  <span className="text-xs font-medium text-slate-400">{customCategory.length} / 10</span>
                </div>
                <div className={`flex h-[54px] items-center rounded-lg border bg-slate-800/70 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-400/20 ${errors.customCategory ? "border-red-400/70" : "border-slate-700"}`}>
                  <button
                    type="button"
                    aria-label="Annulla categoria personalizzata"
                    onClick={() => {
                      setCategory("");
                      setCustomCategory("");
                    }}
                    className="flex h-full w-12 items-center justify-center text-slate-400 transition-colors hover:text-white"
                  >
                    <FiX size={20} aria-hidden="true" />
                  </button>
                  <input
                    value={customCategory}
                    minLength={3}
                    maxLength={10}
                    aria-invalid={Boolean(errors.customCategory)}
                    onChange={(event) => {
                      setCustomCategory(event.target.value);
                      setFieldErrorCleared("customCategory");
                    }}
                    placeholder="Categoria personalizzata"
                    className="h-full min-w-0 flex-1 bg-transparent pr-5 text-base text-white outline-none placeholder:text-slate-500"
                  />
                </div>
                {errors.customCategory ? <p className="mt-2 text-xs font-medium text-red-300">{errors.customCategory}</p> : null}
              </div>
            ) : (
              <DropdownField
                label="Categoria"
                value={category}
                options={categoryOptions}
                placeholder="Categoria"
                error={errors.category}
                onChange={(value) => {
                  setCategory(value);
                  setFieldErrorCleared("category");
                }}
              />
            )}
                </div>

                <div className="mt-9">
            <TextAreaField
              label="Descrizione"
              count={`${description.length} / 256`}
              maxLength={256}
              value={description}
              error={errors.description}
              onChange={(event) => {
                setDescription(event.target.value);
                setFieldErrorCleared("description");
              }}
              placeholder="Descrivi gli obiettivi e i traguardi del progetto..."
            />
                </div>

                <div className="mt-12 grid gap-12 md:grid-cols-2 md:gap-16">
            <div>
              <h3 className="mb-6 text-sm font-bold text-slate-100">Foto profilo / Logo</h3>
              <div className="flex items-center gap-5">
                <input
                  id={fileInputId}
                  type="file"
                  accept="image/png,image/jpeg"
                  className="hidden"
                  onChange={(event) => {
                    void handlePhotoChange(event.target.files?.[0]);
                    event.target.value = "";
                  }}
                />
                <div className="relative h-[106px] w-[106px]">
                  <label
                    htmlFor={fileInputId}
                    className="flex h-full w-full cursor-pointer items-center justify-center rounded-full border-2 border-dashed border-slate-600 bg-slate-800/30 text-slate-400 transition-colors hover:border-slate-400 hover:text-white"
                    aria-label="Carica foto cliente"
                  >
                    {imageCrop.previewUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={imageCrop.previewUrl} alt="Anteprima logo cliente" className="h-full w-full rounded-full object-cover" />
                    ) : (
                      <FiPlus size={34} aria-hidden="true" />
                    )}
                  </label>
                  {imageCrop.previewUrl ? (
                    <button
                      type="button"
                      aria-label="Rimuovi foto cliente"
                      onClick={imageCrop.clearSelectedImage}
                      className="absolute -right-1 -top-1 flex h-8 w-8 items-center justify-center rounded-full border border-slate-700 bg-[#111720] text-slate-300 shadow-lg transition-colors hover:bg-red-500 hover:text-white"
                    >
                      <FiX size={17} aria-hidden="true" />
                    </button>
                  ) : null}
                </div>
                <p className="max-w-[170px] text-sm leading-snug text-slate-400">
                  Carica un file PNG o JPG
                  <br />
                  Max 2MB
                  {imageCrop.selectedImageFile ? (
                    <>
                      <br />
                      <span className="text-slate-300">Foto pronta</span>
                    </>
                  ) : null}
                  {photoError ? (
                    <>
                      <br />
                      <span className="text-red-300">{photoError}</span>
                    </>
                  ) : null}
                </p>
              </div>
            </div>

            <div>
              <ColorPickerField label="Colore del tema" colors={themeColors} value={selectedColor} onChange={setSelectedColor} />
            </div>
                </div>
              </>
            ) : null}

            {currentStep === 2 ? (
              <div className="space-y-8">
                <DropdownField
                  label="Tipo cliente"
                  value={clientType}
                  options={clientTypeOptions}
                  placeholder="Seleziona tipo"
                  error={errors.clientType}
                  onChange={(value) => {
                    setClientType(value);
                    setFieldErrorCleared("clientType");
                  }}
                />

                <div className="grid gap-5 md:grid-cols-2">
                  <TextField
                    label={clientType === "private" ? "Nome e cognome" : "Ragione sociale / Nome legale"}
                    value={legalName}
                    error={errors.legalName}
                    onChange={(event) => {
                      setLegalName(event.target.value);
                      setFieldErrorCleared("legalName");
                    }}
                    placeholder={clientType === "private" ? "es. Mario Rossi" : "es. RedHorn Studio SRL"}
                  />
                  <TextField
                    label="Partita IVA"
                    value={vatNumber}
                    error={errors.vatNumber}
                    onChange={(event) => {
                      setVatNumber(event.target.value.trim().toUpperCase());
                      setFieldErrorCleared("vatNumber");
                    }}
                    placeholder="Opzionale"
                  />
                  <TextField
                    label="Codice fiscale"
                    value={taxCode}
                    error={errors.taxCode}
                    onChange={(event) => {
                      setTaxCode(event.target.value.trim().toUpperCase());
                      setFieldErrorCleared("taxCode");
                    }}
                    placeholder="Opzionale"
                  />
                  <TextField
                    label="PEC"
                    value={pec}
                    error={errors.pec}
                    onChange={(event) => {
                      setPec(event.target.value);
                      setFieldErrorCleared("pec");
                    }}
                    placeholder="nome@pec.it"
                  />
                  {clientType === "company" || clientType === "freelancer" || clientType === "association" ? (
                    <TextField
                      label="Codice SDI"
                      value={sdiCode}
                      error={errors.sdiCode}
                      onChange={(event) => {
                        setSdiCode(event.target.value.trim().toUpperCase());
                        setFieldErrorCleared("sdiCode");
                      }}
                      placeholder="es. ABC1234"
                    />
                  ) : null}
                </div>
              </div>
            ) : null}

            {currentStep === 3 ? (
              <div className="space-y-8">
                <div className="grid gap-5 md:grid-cols-2">
                  <TextField
                    label="Referente principale"
                    value={mainContactName}
                    error={errors.mainContactName}
                    onChange={(event) => {
                      setMainContactName(event.target.value);
                      setFieldErrorCleared("mainContactName");
                    }}
                    placeholder="Nome referente"
                  />
                  <TextField
                    label="Ruolo referente"
                    value={mainContactRole}
                    error={errors.mainContactRole}
                    onChange={(event) => {
                      setMainContactRole(event.target.value);
                      setFieldErrorCleared("mainContactRole");
                    }}
                    placeholder="es. Marketing Manager"
                  />
                  <TextField
                    label="Email"
                    type="email"
                    value={email}
                    error={errors.email}
                    onChange={(event) => {
                      setEmail(event.target.value);
                      setFieldErrorCleared("email");
                    }}
                    placeholder="cliente@email.it"
                  />
                  <div>
                    <p className="mb-2 text-sm font-bold text-slate-100">Telefono</p>
                    <div className="grid grid-cols-[88px_minmax(0,1fr)] gap-3">
                      <div>
                        <div className={`flex h-[54px] items-center rounded-lg border bg-slate-800/70 px-3 text-white focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-400/20 ${errors.phonePrefix ? "border-red-400/70" : "border-slate-700"}`}>
                          <span className="text-slate-400">+</span>
                          <input
                            value={phonePrefix}
                            inputMode="numeric"
                            aria-label="Prefisso telefono"
                            aria-invalid={Boolean(errors.phonePrefix)}
                            onChange={(event) => {
                              setPhonePrefix(sanitizeDigits(event.target.value, 4));
                              setFieldErrorCleared("phonePrefix");
                            }}
                            className="min-w-0 flex-1 bg-transparent text-white outline-none"
                          />
                        </div>
                      </div>
                      <div>
                        <input
                          value={phone}
                          inputMode="numeric"
                          aria-label="Numero telefono"
                          aria-invalid={Boolean(errors.phone)}
                          onChange={(event) => {
                            setPhone(sanitizeDigits(event.target.value, 15));
                            setFieldErrorCleared("phone");
                          }}
                          placeholder="Numero"
                          className={`h-[54px] w-full rounded-lg border bg-slate-800/70 px-5 text-base text-white outline-none transition-colors placeholder:text-slate-500 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 ${
                            errors.phone ? "border-red-400/70" : "border-slate-700"
                          }`}
                        />
                        {errors.phone ? <p className="mt-2 text-xs font-medium text-red-300">{errors.phone}</p> : null}
                      </div>
                    </div>
                    {errors.phonePrefix ? <p className="mt-2 text-xs font-medium text-red-300">{errors.phonePrefix}</p> : null}
                  </div>
                  <TextField
                    label="Email amministrativa"
                    type="email"
                    value={billingEmail}
                    error={errors.billingEmail}
                    onChange={(event) => {
                      setBillingEmail(event.target.value);
                      setFieldErrorCleared("billingEmail");
                    }}
                    placeholder="amministrazione@email.it"
                  />
                  <TextField
                    label="Indirizzo fatturazione"
                    value={address}
                    error={errors.address}
                    onChange={(event) => {
                      setAddress(event.target.value);
                      setFieldErrorCleared("address");
                    }}
                    placeholder="Via, numero civico"
                  />
                  <TextField
                    label="Città"
                    value={city}
                    error={errors.city}
                    onChange={(event) => {
                      setCity(event.target.value);
                      setFieldErrorCleared("city");
                    }}
                    placeholder="Città"
                  />
                  <div className="grid grid-cols-[120px_minmax(0,1fr)] gap-4">
                    <TextField
                      label="CAP"
                      value={postalCode}
                      inputMode="numeric"
                      error={errors.postalCode}
                      onChange={(event) => {
                        setPostalCode(sanitizeDigits(event.target.value, 10));
                        setFieldErrorCleared("postalCode");
                      }}
                      placeholder="00000"
                    />
                    <SearchableDropdownField
                      label="Paese"
                      value={country}
                      options={countryOptions}
                      placeholder="Paese"
                      searchPlaceholder="Cerca paese..."
                      onChange={setCountry}
                    />
                  </div>
                </div>
                <TextAreaField
                  label="Note amministrative"
                  count={`${administrativeNotes.length} / 256`}
                  maxLength={256}
                  value={administrativeNotes}
                  error={errors.administrativeNotes}
                  onChange={(event) => {
                    setAdministrativeNotes(event.target.value);
                    setFieldErrorCleared("administrativeNotes");
                  }}
                  placeholder="Informazioni utili per fatture, contratti o comunicazioni..."
                  className="min-h-[120px]"
                />
              </div>
            ) : null}
          </div>

          <footer className="flex items-center justify-between border-t border-slate-700 px-9 py-6">
          <Button variant="ghost" icon={<FiArrowLeft size={18} />} onClick={currentStep === 1 ? onClose : goBack} className="px-0">
            {currentStep === 1 ? "Esci" : "Indietro"}
          </Button>
          <div className="flex items-center gap-4">
            {submitError ? <p className="max-w-[280px] text-right text-xs font-medium text-red-300">{submitError}</p> : null}
            <Button onClick={goNext} disabled={isSubmitting}>
              {currentStep === 3 ? (isSubmitting ? "Creazione..." : "Crea cliente") : "Avanti"}
            </Button>
          </div>
          </footer>
        </div>
      </Modal>
      <ImageCropModal
        isOpen={imageCrop.isCropModalOpen}
        imageFile={imageCrop.cropSourceFile}
        imageSrc={imageCrop.cropSourceUrl}
        title="Regola foto profilo"
        description="Trascina l'immagine, poi usa zoom e rotazione per rifinire il logo del cliente."
        onConfirm={imageCrop.handleCropConfirm}
        onCancel={imageCrop.handleCropCancel}
      />
    </>
  );
}
