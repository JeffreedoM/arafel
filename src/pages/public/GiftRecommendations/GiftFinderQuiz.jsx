import { useState } from "react";
import { supabase } from "@/lib/supabase-client";
import { Button } from "@/components/ui/button";
import Footer from "../components/Footer";
import Header from "../components/Header";

export default function GiftFinderQuiz() {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Quiz Choices States
  const [occasion, setOccasion] = useState("");
  const [recipient, setRecipient] = useState("");
  const [budget, setBudget] = useState(1000); // Default placeholder price
  const [customNotes, setCustomNotes] = useState("");

  // Guest Information States
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [messengerLink, setMessengerLink] = useState("");

  const nextStep = () => setStep((prev) => prev + 1);
  const prevStep = () => setStep((prev) => prev - 1);

  const resetQuiz = () => {
    setStep(1);
    setOccasion("");
    setRecipient("");
    setBudget(1000);
    setCustomNotes("");
    setCustomerName("");
    setCustomerPhone("");
    setMessengerLink("");
  };

  const handleSubmitQuiz = async (e) => {
    e.preventDefault();

    if (isSubmitting) return;

    if (!customerName.trim() || !customerPhone.trim()) {
      alert(
        "Pakisagutan ang iyong Pangalan at Phone Number para sa pag-verify ng order.",
      );
      return;
    }

    setIsSubmitting(true);

    const uniqueId = Math.floor(1000 + Math.random() * 9000);
    const refNumber = `AGS-QUIZ-${new Date().getFullYear()}-${uniqueId}`;
    const customItemName = `🎁 Custom Gift Package (${occasion} for ${recipient})`;

    try {
      const { error } = await supabase.from("orders").insert([
        {
          reference_number: refNumber,
          total_amount: Number(budget),
          status: "pending",
          customer_name: customerName.trim(),
          customer_phone: customerPhone.trim(),
          messenger_link: messengerLink.trim() || null,
          items: [
            {
              product_id: `quiz-custom-${occasion.toLowerCase()}`,
              product_name: customItemName,
              quantity: 1,
              price: Number(budget),
              notes: customNotes.trim() || "No extra instructions",
            },
          ],
        },
      ]);

      if (error) throw error;

      const messageToCopy = `Hi Arafel's Gift Shop! Requesting details for my Gift Finder match:\n\n👤 **Customer Info**:\nName: ${customerName.trim()}\nPhone: ${customerPhone.trim()}\n\n📋 **Custom Gift Package Request**:\n• Event/Occasion: ${occasion}\n• Recipient: ${recipient}\n• Custom Notes: ${customNotes.trim() || "None"}\n\n📌 Ref No: ${refNumber}\n💰 Target Budget: ₱${Number(budget).toLocaleString()}\n\nNaka-copy na po ang aking order details. Pa-confirm naman po ng bundle options ko. Salamat!`;

      await navigator.clipboard.writeText(messageToCopy);
      alert(
        "🎉 Custom Gift Request saved and copied to clipboard! Opening Facebook Messenger so our team can send you curated options.",
      );

      resetQuiz();
      window.open("https://m.me/100095630491878", "_blank");
    } catch (err) {
      console.error("Quiz submission process failed:", err);
      alert(
        "May nagkaproblema sa pagproseso ng iyong request. Pakisubukan muli.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="wrapper-home bg-background flex min-h-screen flex-col">
        <Header />

        {/* Main Layout Wrapper */}
        <main className="flex flex-grow flex-col items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
          {/* NEW: Page Title Header Section */}
          <div className="mb-8 max-w-md text-center">
            <h1 className="text-3xl font-extrabold tracking-tight text-neutral-900 sm:text-4xl dark:text-neutral-50">
              Find the Perfect Gift
            </h1>
            <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
              Answer a few simple questions, and we'll craft a customized gift
              package tailored to your budget and celebration.
            </p>
          </div>

          {/* Core Card Component Container */}
          <div className="w-full max-w-xl rounded-2xl border border-neutral-200 bg-white p-6 font-[inter] shadow-xl transition-all dark:border-neutral-800 dark:bg-neutral-950">
            {/* Progress Header */}
            <div className="mb-6 flex items-center justify-between text-xs font-bold tracking-wider text-gray-400 uppercase">
              <span>Step {step} of 4</span>
              <div className="h-1.5 w-1/2 overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-900">
                <div
                  className="h-full bg-blue-600 transition-all duration-300"
                  style={{ width: `${(step / 4) * 100}%` }}
                />
              </div>
            </div>

            {/* STEP 1: OCCASION */}
            {step === 1 && (
              <div className="space-y-4">
                <div>
                  <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-50">
                    What is the special occasion?
                  </h2>
                  <p className="mt-1 text-sm text-neutral-400">
                    Select the event you're celebrating.
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    "Birthday",
                    "Anniversary",
                    "Weeksary",
                    "Valentine's",
                    "Graduation",
                    "Just Because",
                  ].map((opt) => (
                    <button
                      key={opt}
                      onClick={() => {
                        setOccasion(opt);
                        nextStep();
                      }}
                      className={`rounded-xl border p-4 text-left font-medium transition ${
                        occasion === opt
                          ? "border-blue-600 bg-blue-50/50 text-blue-600 dark:bg-blue-950/20"
                          : "border-neutral-200 hover:bg-neutral-50 dark:border-neutral-800 dark:hover:bg-neutral-900"
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 2: RECIPIENT */}
            {step === 2 && (
              <div className="space-y-4">
                <div>
                  <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-50">
                    Who is this beautiful gift for?
                  </h2>
                  <p className="mt-1 text-sm text-neutral-400">
                    Help us understand who will receive the package.
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    "Girlfriend",
                    "Boyfriend",
                    "Wife",
                    "Husband",
                    "Mother/Father",
                    "Best Friend",
                  ].map((opt) => (
                    <button
                      key={opt}
                      onClick={() => {
                        setRecipient(opt);
                        nextStep();
                      }}
                      className={`rounded-xl border p-4 text-left font-medium transition ${
                        recipient === opt
                          ? "border-blue-600 bg-blue-50/50 text-blue-600 dark:bg-blue-950/20"
                          : "border-neutral-200 hover:bg-neutral-50 dark:border-neutral-800 dark:hover:bg-neutral-900"
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
                <Button
                  variant="outline"
                  onClick={prevStep}
                  className="mt-2 w-full"
                >
                  Back
                </Button>
              </div>
            )}

            {/* STEP 3: BUDGET & PREFERENCES */}
            {step === 3 && (
              <div className="space-y-4">
                <div>
                  <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-50">
                    Set your budget & details
                  </h2>
                  <p className="mt-1 text-sm text-neutral-400">
                    We will optimize the layout items according to this price
                    ceiling.
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold tracking-wider text-neutral-400 uppercase">
                    Target Budget: ₱{Number(budget).toLocaleString()}
                  </label>
                  <input
                    type="range"
                    min="500"
                    max="10000"
                    step="2500"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-neutral-200 accent-blue-600 dark:bg-neutral-800"
                  />
                  <div className="flex justify-between px-1 text-xs text-neutral-400">
                    <span>₱500</span>
                    <span>₱2.5k</span>
                    <span>₱5k</span>
                    <span>₱7.5k</span>
                    <span>₱10k+</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-neutral-600 dark:text-neutral-300">
                    Special Custom Requests / Notes (Optional)
                  </label>
                  <textarea
                    placeholder="e.g. Include red roses, prefer fairy lights wrapper, write a custom card saying..."
                    value={customNotes}
                    onChange={(e) => setCustomNotes(e.target.value)}
                    rows={3}
                    className="w-full resize-none rounded-lg border border-neutral-200 bg-white p-2.5 text-sm transition outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 dark:border-neutral-800 dark:bg-neutral-900"
                  />
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={prevStep}
                    className="flex-1"
                  >
                    Back
                  </Button>
                  <Button
                    onClick={nextStep}
                    className="flex-1 bg-blue-600 text-white hover:bg-blue-700"
                  >
                    Next Step
                  </Button>
                </div>
              </div>
            )}

            {/* STEP 4: GUEST INFORMATION & SUBMISSION */}
            {step === 4 && (
              <form onSubmit={handleSubmitQuiz} className="space-y-4">
                <div>
                  <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-50">
                    Review & Submit Request
                  </h2>
                  <p className="mt-1 text-sm text-neutral-400">
                    Provide your details to connect with us on Messenger.
                  </p>
                </div>

                <div className="space-y-1.5 rounded-xl border border-neutral-100 bg-neutral-50 p-3.5 text-xs text-neutral-600 dark:border-neutral-800/50 dark:bg-neutral-900/40 dark:text-neutral-300">
                  <p>
                    🎯 <strong>Occasion:</strong> {occasion}
                  </p>
                  <p>
                    👤 <strong>Recipient:</strong> For my {recipient}
                  </p>
                  <p>
                    💰 <strong>Max Budget Allocation:</strong> ₱
                    {Number(budget).toLocaleString()}
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-neutral-600 dark:text-neutral-300">
                      Pangalan (Full Name) *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Jane Doe"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full rounded-lg border border-neutral-200 bg-white p-2.5 text-sm transition outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 dark:border-neutral-800 dark:bg-neutral-900"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-neutral-600 dark:text-neutral-300">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. 09123456789"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="w-full rounded-lg border border-neutral-200 bg-white p-2.5 text-sm transition outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 dark:border-neutral-800 dark:bg-neutral-900"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-neutral-600 dark:text-neutral-300">
                      Messenger Profile Link (Optional)
                    </label>
                    <input
                      type="url"
                      placeholder="e.g. https://facebook.com/janedoe"
                      value={messengerLink}
                      onChange={(e) => setMessengerLink(e.target.value)}
                      className="w-full rounded-lg border border-neutral-200 bg-white p-2.5 text-sm transition outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 dark:border-neutral-800 dark:bg-neutral-900"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={prevStep}
                    disabled={isSubmitting}
                    className="flex-1"
                  >
                    Back
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 bg-blue-600 font-semibold text-white hover:bg-blue-700"
                  >
                    {isSubmitting
                      ? "Creating Request..."
                      : "Send Request via Messenger"}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </main>
      </div>

      <Footer />
    </>
  );
}
