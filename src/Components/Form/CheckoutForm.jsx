import { CardElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { useEffect, useState } from "react";
import "./CheckoutForm.css";
import { ImSpinner9 } from "react-icons/im";
import useAuth from "../../hooks/useAuth";
import useAxiosSecure from "../../hooks/useAxiosSecure";
import useCurrentUser from "../../hooks/useCurrentUser";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import moment from "moment";

const CheckoutForm = ({ packageInfo, handleClose }) => {
  const currentDate = moment().format("YYYY-MM-DD");
  const axiosSecure = useAxiosSecure();
  const stripe = useStripe();
  const elements = useElements();
  const { user } = useAuth();
  const [cardError, setCardError] = useState("");
  const [clientSecret, setClientSecret] = useState("");
  const [processing, setProcessing] = useState(false);
  const { data: currentUser } = useCurrentUser();
  const navigate = useNavigate();
  // Create Payment Intent
  const employeeLimitTotal =
    parseInt(currentUser?.employeeLimitTotal) + parseInt(packageInfo?.member);
  const employeeLimitRemaining =
    parseInt(currentUser?.employeeLimitRemaining) +
    parseInt(packageInfo?.member);

  useEffect(() => {
    if (packageInfo?.price > 0)
      axiosSecure
        .post("create-payment-intent", { price: packageInfo?.price })
        .then((res) => {
          console.log(res.data);
          setClientSecret(res.data);
        });
  }, [axiosSecure, packageInfo]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    const card = elements.getElement(CardElement);
    if (card === null) {
      return;
    }

    const { paymentMethod, error } = await stripe.createPaymentMethod({
      type: "card",
      card,
    });

    if (error) {
      console.log("error", error);
      setCardError(error.message);
    } else {
      setCardError("");
      console.log("payment method", paymentMethod);
    }

    setProcessing(true);

    const { paymentIntent, error: confirmError } =
      await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: card,
          billing_details: {
            email: user?.email,
            name: user?.displayName,
          },
        },
      });

    if (confirmError) {
      console.log(confirmError);
      setCardError(confirmError.message);
    }

    if (paymentIntent.status === "succeeded") {
      const paymentInfo = {
        paymentID: paymentIntent.id,
        email: currentUser?.email,
        amount: packageInfo?.price,
        date: currentDate,
      };

      const limit = {
        employeeLimitTotal: employeeLimitTotal,
        employeeLimitRemaining: employeeLimitRemaining,
      };
      console.log(employeeLimitTotal, employeeLimitRemaining, limit);
      axiosSecure
        .patch(`/admin/extend-employee-limit/${user?.email}`, limit)
        .then((res) => {
          toast.success("Payment Successful");
          navigate("/admin/dashboard");
          axiosSecure.post("/payment-info", paymentInfo).then((res) => {});
        });

      setProcessing(false);
    }
  };

  return (
    <>
      <form className="my-2" onSubmit={handleSubmit}>
        <CardElement
          options={{
            style: {
              base: {
                fontSize: "16px",
                color: "#424770",
                "::placeholder": {
                  color: "#aab7c4",
                },
              },
              invalid: {
                color: "#9e2146",
              },
            },
          }}
        />
        <div className="flex mt-2 justify-around">
          <button
            type="button"
            className="inline-flex justify-center rounded-md border border-transparent bg-red-100 px-4 py-2 text-sm font-medium text-red-900 hover:bg-red-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
            onClick={handleClose}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!stripe || !clientSecret || processing}
            className="inline-flex justify-center rounded-md border border-transparent bg-green-100 px-4 py-2 text-sm font-medium text-green-900 hover:bg-green-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2"
          >
            {processing ? (
              <ImSpinner9 className="m-auto animate-spin" size={24} />
            ) : (
              `Pay ${packageInfo?.price}$`
            )}
          </button>
        </div>
      </form>
      {cardError && <p className="text-red-600 ml-8">{cardError}</p>}
    </>
  );
};

export default CheckoutForm;
