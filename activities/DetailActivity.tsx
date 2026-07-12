import { useActivity } from "@stackflow/react";
import { AppScreen } from "@stackflow/plugin-basic-ui";
import { motion } from "framer-motion";
import { Button } from "../components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerPanel,
  DrawerPopup,
  DrawerTitle,
  DrawerTrigger,
} from "../components/ui/drawer";

type DetailParams = {
  title: string;
  id: string;
};

export const DetailActivity: React.FC<any> = ({ params }: any) => {
  const { isTop } = useActivity();
  const title = params.title as string;
  const id = params.id as string;

  return (
    <AppScreen 
      appBar={{ 
        title: (
          <motion.span 
            layoutId={isTop ? `title-${id}` : undefined}
            className="relative z-[99999] inline-block font-bold"
            transition={{ duration: 0.3 }}
          >
            {title}
          </motion.span>
        ) 
      }}
    >
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.3 }}
        className="flex flex-col p-4"
      >
        <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
          <p className="text-sm text-gray-500 mb-4">Item ID: {id}</p>
          <div className="space-y-3 text-gray-700 dark:text-gray-300">
            <p>
              This is the deep detail view. We are now 3 levels deep into the stack!
            </p>
            <p>
              Notice how the title animated from the card to the header, and how you can simply swipe back or press the back button in the App Bar to go to the previous screen.
            </p>
            <div className="pt-4">
              <Drawer>
                <DrawerTrigger render={<Button variant="outline" />}>
                  Nested drawers
                </DrawerTrigger>
                <DrawerPopup showBar>
                  <DrawerHeader className="text-center">
                    <DrawerTitle>First step</DrawerTitle>
                    <DrawerDescription>
                      This is the first step. Tap the button below to continue to the next
                      screen.
                    </DrawerDescription>
                  </DrawerHeader>
                  <DrawerFooter
                    className="justify-center sm:justify-center"
                    variant="bare"
                  >
                    <DrawerClose render={<Button variant="ghost" />}>Cancel</DrawerClose>
                    <Drawer>
                      <DrawerTrigger render={<Button variant="outline" />}>
                        Continue
                      </DrawerTrigger>
                      <DrawerPopup showBar>
                        <DrawerHeader className="text-center">
                          <DrawerTitle>Second step</DrawerTitle>
                          <DrawerDescription>
                            You&apos;ve reached the second step. Tap the button below to
                            continue to the next screen.
                          </DrawerDescription>
                        </DrawerHeader>
                        <DrawerPanel>
                          <div className="flex justify-center">
                            <div className="size-48 shrink-0 rounded-xl border bg-muted" />
                          </div>
                        </DrawerPanel>
                        <DrawerFooter
                          className="justify-center sm:justify-center"
                          variant="bare"
                        >
                          <DrawerClose render={<Button variant="ghost" />}>
                            Back
                          </DrawerClose>
                          <Drawer>
                            <DrawerTrigger render={<Button variant="outline" />}>
                              Continue
                            </DrawerTrigger>
                            <DrawerPopup showBar>
                              <DrawerHeader className="text-center">
                                <DrawerTitle>Third step</DrawerTitle>
                                <DrawerDescription>
                                  You&apos;ve reached the final step. You can close this
                                  drawer or go back.
                                </DrawerDescription>
                              </DrawerHeader>
                              <DrawerPanel>
                                <div className="flex justify-center">
                                  <div className="size-32 shrink-0 rounded-full border bg-muted" />
                                </div>
                              </DrawerPanel>
                            </DrawerPopup>
                          </Drawer>
                        </DrawerFooter>
                      </DrawerPopup>
                    </Drawer>
                  </DrawerFooter>
                </DrawerPopup>
              </Drawer>
            </div>
          </div>
        </div>
      </motion.div>
    </AppScreen>
  );
};
