import { Button } from "@/components/ui/button";
import { footerConfig } from "@/config/footer";
import { Edit3, MessageCircle } from "lucide-react";
import Link from "next/link";

export function FeedbackSection() {
  const { feedback } = footerConfig;

  return (
    <div className="bg-gradient-to-br from-emerald-50 to-teal-50 py-12">
      <div className="px-4 md:container md:mx-auto text-center">
        <div className="bg-white rounded-2xl p-8 md:p-12 shadow-lg">
          <div className="mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full mb-4">
              <MessageCircle className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              {feedback.title}
            </h2>
            <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
              {feedback.description}
            </p>
          </div>
          <Link href={feedback.url} target="_blank" rel="noopener noreferrer">
            <Button
              size="lg"
              className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold py-4 px-8 rounded-full shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300"
            >
              <Edit3 className="w-5 h-5 mr-2" />
              {feedback.buttonText}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
