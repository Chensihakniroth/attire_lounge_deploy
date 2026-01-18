import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ChevronLeft, Send, Gift, Package, Pencil, ShoppingCart, Check, Copy, Instagram, Facebook, Mail, Phone } from 'lucide-react';

const giftOptions = {
  ties: [
    { id: 'tie-red', name: 'Silk Tie', color: 'Red', image: 'https://placehold.co/300x400/A83232/FFF?text=Red+Tie' },
    { id: 'tie-blue', name: 'Silk Tie', color: 'Blue', image: 'https://placehold.co/300x400/3264A8/FFF?text=Blue+Tie' },
    { id: 'tie-green', name: 'Silk Tie', color: 'Green', image: 'https://placehold.co/300x400/32A852/FFF?text=Green+Tie' },
    { id: 'tie-black', name: 'Silk Tie', color: 'Black', image: 'https://placehold.co/300x400/333/FFF?text=Black+Tie' },
  ],
  pocketSquares: [
    { id: 'ps-white', name: 'Linen Pocket Square', color: 'White', image: 'https://placehold.co/300x400/EEE/333?text=White+PS' },
    { id: 'ps-navy', name: 'Linen Pocket Square', color: 'Navy', image: 'https://placehold.co/300x400/0d3542/FFF?text=Navy+PS' },
    { id: 'ps-burgundy', name: 'Linen Pocket Square', color: 'Burgundy', image: 'https://placehold.co/300x400/800020/FFF?text=Burgundy+PS' },
    { id: 'ps-gold', name: 'Linen Pocket Square', color: 'Gold', image: 'https://placehold.co/300x400/FFD700/333?text=Gold+PS' },
    { id: 'ps-pattern', name: 'Patterned Pocket Square', color: 'Patterned', image: 'https://placehold.co/300x400/DDD/333?text=Patterned+PS' },
  ],
  boxes: [
    { id: 'box-normal', name: 'Normal Box', image: 'https://placehold.co/300x300/666/FFF?text=Normal+Box' },
    { id: 'box-big', name: 'Big Box', image: 'https://placehold.co/300x300/444/FFF?text=Big+Box' },
    { id: 'box-designer', name: 'Designer Box', image: 'https://placehold.co/300x300/222/FFF?text=Designer+Box' },
  ],
};

const SelectionCard = ({ item, isSelected, onSelect }) => (
    <motion.div
        onClick={onSelect}
        className={`relative rounded-lg overflow-hidden border-2 cursor-pointer transition-all duration-300 ${isSelected ? 'border-attire-accent' : 'border-transparent'}`}
        whileHover={{ scale: 1.05 }}
    >
        <div className="absolute inset-0 bg-black/20 z-10"></div>
        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
        <div className="absolute bottom-0 left-0 p-3 z-20">
            <h4 className="font-semibold text-white">{item.name}</h4>
            {item.color && <p className="text-sm text-white/80">{item.color}</p>}
        </div>
        {isSelected && (
            <motion.div
                layoutId={`selected-check-${item.id}`}
                className="absolute top-2 right-2 bg-attire-accent text-attire-dark rounded-full w-6 h-6 flex items-center justify-center z-20"
            >
                <Check size={16} />
            </motion.div>
        )}
    </motion.div>
);

const SocialLink = ({ href, icon, label }) => (
    <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="flex flex-col items-center gap-2 text-attire-silver hover:text-white hover:scale-105 transition-all"
    >
        {icon}
        <span className="text-xs">{label}</span>
    </a>
);

const CustomizeGiftPage = () => {
    const [selectedTie, setSelectedTie] = useState(null);
    const [selectedPocketSquare, setSelectedPocketSquare] = useState(null);
    const [selectedBox, setSelectedBox] = useState(null);
    const [note, setNote] = useState('');
    const [generatedMessage, setGeneratedMessage] = useState('');
    const [isCopied, setIsCopied] = useState(false);

    const isComplete = selectedTie && selectedPocketSquare && selectedBox;

    const handleFinalize = () => {
        if (!isComplete) return;

        const message = `
New Custom Gift Box Order:
---------------------------
Tie: ${selectedTie.name} (${selectedTie.color})
Pocket Square: ${selectedPocketSquare.name} (${selectedPocketSquare.color})
Box: ${selectedBox.name}
${note ? `\nNote: "${note}"` : ''}
---------------------------
Please confirm availability and total price.
        `.trim().replace(/^\s+/gm, '');

        setGeneratedMessage(message);
        window.scrollTo(0, 0);
    };

    const handleCopyToClipboard = () => {
        navigator.clipboard.writeText(generatedMessage);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };
    
    const resetSelections = () => {
        setSelectedTie(null);
        setSelectedPocketSquare(null);
        setSelectedBox(null);
        setNote('');
        setGeneratedMessage('');
        setIsCopied(false);
    }

    if (generatedMessage) {
        const telegramUrl = `https://t.me/attireloungeofficial?text=${encodeURIComponent(generatedMessage)}`;
        const mailUrl = `mailto:attireloungekh@gmail.com?subject=Custom Gift Box Order&body=${encodeURIComponent(generatedMessage)}`;

        return (
            <div className="min-h-screen bg-attire-navy py-12 md:py-24 flex items-center justify-center">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="max-w-2xl w-full mx-auto px-4"
                >
                    <div className="bg-attire-dark/40 backdrop-blur-lg rounded-2xl border border-white/10 shadow-lg p-8 text-center">
                        <h1 className="text-3xl md:text-4xl font-serif text-white mb-4">Your Order is Ready</h1>
                        <p className="text-attire-silver mb-6">
                            Copy the text below and send it to us on your preferred platform, or use one of the quick links.
                        </p>

                        <div className="bg-attire-dark/50 p-4 rounded-lg border border-white/10 text-left mb-6">
                            <pre className="text-attire-cream whitespace-pre-wrap text-sm">{generatedMessage}</pre>
                        </div>
                        
                        <button
                            onClick={handleCopyToClipboard}
                            className="w-full mb-8 px-6 py-3 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2 bg-attire-accent text-attire-dark hover:opacity-90"
                        >
                            {isCopied ? <><Check size={20} /> Copied!</> : <><Copy size={20} /> Copy to Clipboard</>}
                        </button>

                        <h2 className="text-xl font-serif text-white mb-4">Contact us via</h2>
                        <div className="flex items-center justify-center gap-8">
                            <SocialLink href={telegramUrl} icon={<Send size={24} />} label="Telegram" />
                            <SocialLink href={mailUrl} icon={<Mail size={24} />} label="Email" />
                            <SocialLink href="https://instagram.com/attireloungeofficial" icon={<Instagram size={24} />} label="Instagram" />
                            <SocialLink href="https://facebook.com/attireloungeofficial" icon={<Facebook size={24} />} label="Facebook" />
                            <SocialLink href="tel:+85569256369" icon={<Phone size={24} />} label="Call Us" />
                        </div>
                        
                        <div className="border-t border-white/10 my-8"></div>

                        <button onClick={resetSelections} className="text-attire-silver hover:text-white transition-colors">
                            Create Another Gift
                        </button>
                    </div>
                </motion.div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-attire-navy py-12 md:py-24">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-serif text-white mb-4">
                        Customize a Gift Box
                    </h1>
                    <p className="text-lg text-attire-silver max-w-2xl mx-auto">
                        Select one of each item to create a unique and thoughtful gift.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Selection Area */}
                    <div className="lg:col-span-2 space-y-12">
                        {/* Ties */}
                        <section>
                            <h2 className="text-2xl font-serif text-white mb-6">1. Choose a Tie</h2>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {giftOptions.ties.map(tie => (
                                    <SelectionCard
                                        key={tie.id}
                                        item={tie}
                                        isSelected={selectedTie?.id === tie.id}
                                        onSelect={() => setSelectedTie(tie)}
                                    />
                                ))}
                            </div>
                        </section>

                        {/* Pocket Squares */}
                        <section>
                            <h2 className="text-2xl font-serif text-white mb-6">2. Choose a Pocket Square</h2>
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                                {giftOptions.pocketSquares.map(ps => (
                                    <SelectionCard
                                        key={ps.id}
                                        item={ps}
                                        isSelected={selectedPocketSquare?.id === ps.id}
                                        onSelect={() => setSelectedPocketSquare(ps)}
                                    />
                                ))}
                            </div>
                        </section>

                        {/* Boxes */}
                        <section>
                            <h2 className="text-2xl font-serif text-white mb-6">3. Choose a Box</h2>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {giftOptions.boxes.map(box => (
                                    <SelectionCard
                                        key={box.id}
                                        item={box}
                                        isSelected={selectedBox?.id === box.id}
                                        onSelect={() => setSelectedBox(box)}
                                    />
                                ))}
                            </div>
                        </section>
                        
                        {/* Note */}
                        <section>
                            <h2 className="text-2xl font-serif text-white mb-6">4. Write a Personal Note (Optional)</h2>
                            <textarea
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                                placeholder="e.g. Happy Birthday, John!"
                                className="w-full p-4 rounded-lg border bg-attire-dark/50 text-attire-cream placeholder-attire-silver/70 focus:border-white focus:ring-1 focus:ring-white transition-colors resize-none"
                                rows="4"
                            ></textarea>
                        </section>
                    </div>

                    {/* Sidebar Summary */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-28 bg-attire-dark/40 backdrop-blur-lg rounded-2xl border border-white/10 shadow-lg p-6">
                            <h3 className="text-2xl font-serif text-white mb-6 flex items-center gap-3">
                                <ShoppingCart size={24} />
                                Your Gift Box
                            </h3>
                            <div className="space-y-4">
                                {/* Tie */}
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-20 rounded-md bg-attire-charcoal flex-shrink-0 overflow-hidden">
                                        {selectedTie && <img src={selectedTie.image} alt={selectedTie.name} className="w-full h-full object-cover" />}
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-white">{selectedTie ? `${selectedTie.name} (${selectedTie.color})` : 'No Tie Selected'}</h4>
                                        <p className="text-sm text-attire-silver">Tie</p>
                                    </div>
                                </div>
                                {/* Pocket Square */}
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-20 rounded-md bg-attire-charcoal flex-shrink-0 overflow-hidden">
                                        {selectedPocketSquare && <img src={selectedPocketSquare.image} alt={selectedPocketSquare.name} className="w-full h-full object-cover" />}
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-white">{selectedPocketSquare ? `${selectedPocketSquare.name} (${selectedPocketSquare.color})` : 'No Pocket Square Selected'}</h4>
                                        <p className="text-sm text-attire-silver">Pocket Square</p>
                                    </div>
                                </div>
                                {/* Box */}
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-20 rounded-md bg-attire-charcoal flex-shrink-0 overflow-hidden">
                                        {selectedBox && <img src={selectedBox.image} alt={selectedBox.name} className="w-full h-full object-cover" />}
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-white">{selectedBox ? selectedBox.name : 'No Box Selected'}</h4>
                                        <p className="text-sm text-attire-silver">Box</p>
                                    </div>
                                </div>
                                {/* Note */}
                                <div className="flex items-start gap-4">
                                    <div className="w-16 h-20 rounded-md bg-attire-charcoal flex-shrink-0 flex items-center justify-center">
                                        <Pencil size={24} className="text-attire-silver" />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-white">Personal Note</h4>
                                        <p className="text-sm text-attire-silver italic">
                                            {note ? `"${note}"` : 'No note added.'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="border-t border-white/10 my-6"></div>
                            <button
                                onClick={handleFinalize}
                                disabled={!isComplete}
                                className="w-full px-6 py-3 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2 bg-attire-accent text-attire-dark disabled:bg-gray-500 disabled:text-gray-300 disabled:cursor-not-allowed hover:opacity-90"
                            >
                                <Send className="w-5 h-5" />
                                Finalize Gift
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CustomizeGiftPage;
