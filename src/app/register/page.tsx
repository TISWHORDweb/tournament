import { RegistrationWizard } from "@/components/registration/RegistrationWizard";
import { getRegistrationAvailability } from "@/actions/registration";

export const dynamic = "force-dynamic";

export default async function RegisterPage() {
  const availability = await getRegistrationAvailability();

  return (
    <div className="min-h-screen pt-28 pb-16">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <h1 className="font-display text-3xl font-bold text-white sm:text-4xl">
            Tournament Registration
          </h1>
          <p className="mt-3 text-slate-400">
            Complete the steps below to join the Tech Turf Championship
          </p>
        </div>
        <RegistrationWizard
          availability={availability}
          registrationFee={availability.settings.registrationFee}
        />
      </div>
    </div>
  );
}
