"use client";
import { Button } from "@/components/ui/button";
import { Drawer, DrawerPopup, DrawerTrigger, DrawerHeader, DrawerTitle, DrawerPanel } from "@/components/ui/drawer";

export default function TestPage() {
  return (
    <div className="p-12">
      <Drawer>
        <DrawerTrigger render={<Button>Open Drawer</Button>} />
        <DrawerPopup>
          <DrawerHeader>
            <DrawerTitle>Test</DrawerTitle>
          </DrawerHeader>
          <DrawerPanel>Content</DrawerPanel>
        </DrawerPopup>
      </Drawer>
    </div>
  );
}
