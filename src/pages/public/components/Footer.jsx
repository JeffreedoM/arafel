import {
  IconBrandFacebook,
  IconBrandInstagram,
  IconMail,
} from "@tabler/icons-react";

export default function Footer() {
  return (
    <section className="h-[40vh] bg-gray-50">
      <div className="wrapper-home text-foreground/70 py-10 text-sm">
        <div className="mb-10 grid grid-cols-2">
          <div>
            <p className="font-semibold">QUICK LINKS</p>
            <div>
              <ul className="mt-5 flex flex-col gap-3">
                <li>Products</li>
                <li>Categories</li>
                <li>Cart</li>
                <li>About Us</li>
                <li>Contact Us</li>
              </ul>
            </div>
          </div>
          <div>
            <p className="mb-5 font-semibold">FOLLOW US</p>

            <div className="flex flex-col gap-3">
              <div className="flex items-center">
                <div className="text-background rounded-full bg-gray-500 p-2">
                  <IconBrandFacebook />
                </div>
                <span className="ml-4">Facebook</span>
              </div>

              <div className="flex items-center">
                <div className="text-background rounded-full bg-gray-500 p-2">
                  <IconBrandInstagram />
                </div>
                <span className="ml-4">Instagram</span>
              </div>

              <div className="flex items-center">
                <div className="text-background rounded-full bg-gray-500 p-2">
                  <IconMail />
                </div>
                <span className="ml-4">arafelgiftshop@email.com</span>
              </div>
            </div>
          </div>
        </div>

        <hr />
        <p className="text-foreground/50 mt-10">
          © 2025 Arafel's Gift Shop. All Rights Reserved .
        </p>
      </div>
    </section>
  );
}
