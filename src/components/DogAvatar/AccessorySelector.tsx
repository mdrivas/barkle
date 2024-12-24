import { Dialog, DialogContent } from "~/components/ui/dialog";
import { cn } from "~/lib/utils";

interface AccessorySelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (accessoryId: number) => void;
  selectedAccessory: number | null;
}

const ACCESSORIES = [
  { id: 1, name: "Party Hat", image: "/accessories/partyhat.png" },
  { id: 2, name: "Santa Hat", image: "/accessories/santahat.png" },
  { id: 3, name: "None", image: null },
];

export function AccessorySelector({
  isOpen,
  onClose,
  onSelect,
  selectedAccessory
}: AccessorySelectorProps) {
  return (
    <Dialog open={isOpen} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-md bg-zinc-900 p-6 text-zinc-50">
        <h2 className="mb-4 text-xl font-bold">Choose an Accessory</h2>
        <div className="grid grid-cols-3 gap-4">
          {ACCESSORIES.map((accessory) => (
            <button
              key={accessory.id}
              onClick={() => onSelect(accessory.id)}
              className={cn(
                "relative aspect-square rounded-lg border-2 p-2 transition-all",
                selectedAccessory === accessory.id
                  ? "border-green-500 bg-green-500/10"
                  : "border-zinc-700 hover:border-zinc-500"
              )}
            >
              {accessory.image ? (
                <img
                  src={accessory.image}
                  alt={accessory.name}
                  className="h-full w-full object-contain"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-zinc-400">
                  No Accessory
                </div>
              )}
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
} 